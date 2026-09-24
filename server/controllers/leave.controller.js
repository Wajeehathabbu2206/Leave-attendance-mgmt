import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import ClassSection from '../models/ClassSection.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Student from '../models/Student.js';

function response(res, status, message, data) {
  return res.status(status).json({ success: status < 400, message, ...(data === undefined ? {} : { data }) });
}

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

function datesBetween(fromDate, toDate) {
  const dates = [];
  for (let current = new Date(`${fromDate}T00:00:00Z`); current <= new Date(`${toDate}T00:00:00Z`); current.setUTCDate(current.getUTCDate() + 1)) {
    dates.push(current.toISOString().slice(0, 10));
  }
  return dates;
}

async function teacherClass(classSectionId, teacherId) {
  if (!validId(classSectionId)) return null;
  return ClassSection.findOne({ _id: classSectionId, classTeacherId: teacherId });
}

export async function createLeave(req, res) {
  try {
    const { fromDate, toDate, type, reason } = req.body;
    if (!validDate(fromDate) || !validDate(toDate) || fromDate > toDate) return response(res, 400, 'Leave dates must be valid and fromDate must not be after toDate');
    if (!['sick', 'casual', 'other'].includes(type) || !reason?.trim()) return response(res, 400, 'A valid leave type and reason are required');
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return response(res, 404, 'Student profile not found');

    const overlap = await LeaveRequest.exists({ studentId: student._id, status: { $in: ['pending', 'approved'] }, fromDate: { $lte: toDate }, toDate: { $gte: fromDate } });
    if (overlap) return response(res, 409, 'This leave overlaps an existing pending or approved request');
    const leave = await LeaveRequest.create({ studentId: student._id, classSectionId: student.classSectionId, fromDate, toDate, type, reason: reason.trim() });
    return response(res, 201, 'Leave request submitted', leave);
  } catch (error) {
    return response(res, 500, 'Unable to submit leave request', error.message);
  }
}

export async function listStudentLeaves(req, res) {
  try {
    const student = await Student.findOne({ userId: req.user.userId }).select('_id');
    if (!student) return response(res, 404, 'Student profile not found');
    const leaves = await LeaveRequest.find({ studentId: student._id }).select('fromDate toDate type reason status teacherRemarks createdAt').sort({ createdAt: -1 });
    return response(res, 200, 'Leave requests loaded', leaves);
  } catch (error) {
    return response(res, 500, 'Unable to load leave requests', error.message);
  }
}

export async function listTeacherLeaves(req, res) {
  try {
    const { classSectionId, status = 'pending' } = req.query;
    if (!(await teacherClass(classSectionId, req.user.userId))) return response(res, 403, 'You can only review leave for your assigned class');
    if (!['pending', 'approved', 'rejected'].includes(status)) return response(res, 400, 'Invalid leave status');
    const leaves = await LeaveRequest.find({ classSectionId, status }).populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } }).sort({ createdAt: 1 });
    return response(res, 200, 'Leave requests loaded', leaves);
  } catch (error) {
    return response(res, 500, 'Unable to load leave requests', error.message);
  }
}

export async function reviewLeave(req, res) {
  try {
    const { status, teacherRemarks } = req.body;
    if (!['approved', 'rejected'].includes(status)) return response(res, 400, 'Status must be approved or rejected');
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return response(res, 404, 'Leave request not found');
    if (!(await teacherClass(leave.classSectionId, req.user.userId))) return response(res, 403, 'You can only review leave for your assigned class');
    if (leave.status !== 'pending') return response(res, 409, 'Only pending leave requests can be reviewed');

    leave.status = status;
    leave.reviewedBy = req.user.userId;
    leave.reviewedAt = new Date();
    leave.teacherRemarks = teacherRemarks?.trim();
    await leave.save();

    if (status === 'approved') {
      const dates = datesBetween(leave.fromDate, leave.toDate);
      const existing = await Attendance.find({ studentId: leave.studentId, date: { $in: dates } }).select('date status');
      const existingByDate = new Map(existing.map((record) => [record.date, record.status]));
      const operations = dates.filter((date) => existingByDate.get(date) !== 'present').map((date) => ({
        updateOne: {
          filter: { studentId: leave.studentId, date },
          update: { $set: { classSectionId: leave.classSectionId, status: 'leave', markedBy: req.user.userId } },
          upsert: true,
        },
      }));
      if (operations.length) await Attendance.bulkWrite(operations);
    }
    return response(res, 200, `Leave request ${status}`, leave);
  } catch (error) {
    return response(res, 500, 'Unable to review leave request', error.message);
  }
}

export async function listParentLeaves(req, res) {
  try {
    if (!validId(req.query.studentId)) return response(res, 400, 'A valid studentId is required');
    const student = await Student.findOne({ _id: req.query.studentId, parentIds: req.user.userId });
    if (!student) return response(res, 403, 'You can only view leave for your linked children');
    const leaves = await LeaveRequest.find({ studentId: student._id }).select('fromDate toDate type reason status teacherRemarks createdAt').sort({ createdAt: -1 });
    return response(res, 200, 'Leave requests loaded', leaves);
  } catch (error) {
    return response(res, 500, 'Unable to load leave requests', error.message);
  }
}