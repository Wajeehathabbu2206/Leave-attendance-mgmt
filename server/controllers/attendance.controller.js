import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import ClassSection from '../models/ClassSection.js';
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

function periodFilter(month, year) {
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12 || !Number.isInteger(yearNumber) || yearNumber < 2000 || yearNumber > 2100) return null;
  return { month: String(monthNumber).padStart(2, '0'), year: String(yearNumber) };
}

function attendanceSummary(records) {
  const attended = records.filter((record) => record.status === 'present' || record.status === 'late').length;
  return { records: records.map((record) => ({ date: record.date, status: record.status })), percentage: records.length ? Number(((attended / records.length) * 100).toFixed(2)) : 0 };
}

export async function listTeacherClasses(req, res) {
  try {
    const classes = await ClassSection.find({ classTeacherId: req.user.userId }).select('grade section').sort({ grade: 1, section: 1 });
    return response(res, 200, 'Teacher classes loaded', classes);
  } catch (error) {
    return response(res, 500, 'Unable to load teacher classes', error.message);
  }
}

async function getTeacherClass(classSectionId, teacherId) {
  if (!validId(classSectionId)) return null;
  return ClassSection.findOne({ _id: classSectionId, classTeacherId: teacherId });
}

export async function saveAttendance(req, res) {
  try {
    const { classSectionId, date, records } = req.body;
    if (!classSectionId || !validDate(date) || !Array.isArray(records)) return response(res, 400, 'classSectionId, a valid date, and records are required');
    if (!(await getTeacherClass(classSectionId, req.user.userId))) return response(res, 403, 'You can only mark attendance for your assigned classes');

    const students = await Student.find({ classSectionId }).select('_id');
    const studentIds = new Set(students.map((student) => student._id.toString()));
    const recordIds = records.map((record) => record.studentId);
    if (recordIds.some((studentId) => !validId(studentId) || !studentIds.has(studentId)) || new Set(recordIds).size !== recordIds.length) {
      return response(res, 400, 'Every student must belong to the selected class and appear only once');
    }
    if (records.some((record) => !['present', 'absent', 'late'].includes(record.status))) return response(res, 400, 'Each attendance status must be present, absent, or late');

    const operations = records.map(({ studentId, status, remarks }) => ({
      updateOne: {
        filter: { studentId, date },
        update: { $set: { classSectionId, status, remarks, markedBy: req.user.userId } },
        upsert: true,
      },
    }));
    if (operations.length) await Attendance.bulkWrite(operations);
    return response(res, 200, 'Attendance saved', { updated: records.length });
  } catch (error) {
    return response(res, 500, 'Unable to save attendance', error.message);
  }
}

export async function getTeacherAttendance(req, res) {
  try {
    const { classSectionId, date } = req.query;
    if (!validDate(date)) return response(res, 400, 'A valid date in YYYY-MM-DD format is required');
    if (!(await getTeacherClass(classSectionId, req.user.userId))) return response(res, 403, 'You can only view attendance for your assigned classes');
    const students = await Student.find({ classSectionId }).populate('userId', 'name').sort({ rollNo: 1 });
    const records = await Attendance.find({ classSectionId, date }).select('studentId status remarks');
    const byStudent = new Map(records.map((record) => [record.studentId.toString(), record]));
    const roster = students.map((student) => ({ studentId: student._id, name: student.userId?.name, rollNo: student.rollNo, status: byStudent.get(student._id.toString())?.status || 'unmarked', remarks: byStudent.get(student._id.toString())?.remarks || '' }));
    return response(res, 200, 'Attendance loaded', roster);
  } catch (error) {
    return response(res, 500, 'Unable to load attendance', error.message);
  }
}

async function getAttendanceForStudent(studentId, month, year) {
  const period = periodFilter(month, year);
  if (!validId(studentId) || !period) return null;
  const records = await Attendance.find({ studentId, date: { $regex: `^${period.year}-${period.month}-` } }).sort({ date: 1 }).select('date status');
  return attendanceSummary(records);
}

export async function getStudentAttendance(req, res) {
  try {
    const { month, year } = req.query;
    const student = req.query.studentId ? await Student.findById(req.query.studentId) : await Student.findOne({ userId: req.user.userId });
    if (!student || student.userId.toString() !== req.user.userId) return response(res, 403, 'You can only view your own attendance');
    const data = await getAttendanceForStudent(student._id, month, year);
    if (!data) return response(res, 400, 'Valid month (1-12) and year are required');
    return response(res, 200, 'Attendance loaded', data);
  } catch (error) {
    return response(res, 500, 'Unable to load attendance', error.message);
  }
}

export async function listParentChildren(req, res) {
  try {
    const children = await Student.find({ parentIds: req.user.userId }).populate('userId', 'name email').populate('classSectionId', 'grade section');
    return response(res, 200, 'Children loaded', children);
  } catch (error) {
    return response(res, 500, 'Unable to load children', error.message);
  }
}

export async function getParentAttendance(req, res) {
  try {
    const { studentId, month, year } = req.query;
    if (!validId(studentId)) return response(res, 400, 'A valid studentId is required');
    const student = await Student.findOne({ _id: studentId, parentIds: req.user.userId });
    if (!student) return response(res, 403, 'You can only view attendance for your linked children');
    const data = await getAttendanceForStudent(student._id, month, year);
    if (!data) return response(res, 400, 'Valid month (1-12) and year are required');
    return response(res, 200, 'Attendance loaded', data);
  } catch (error) {
    return response(res, 500, 'Unable to load attendance', error.message);
  }
}