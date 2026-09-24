import mongoose from 'mongoose';
import ClassSection from '../models/ClassSection.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import Timetable from '../models/Timetable.js';
import User from '../models/User.js';

function response(res, status, message, data) {
  return res.status(status).json({ success: status < 400, message, ...(data === undefined ? {} : { data }) });
}

function validId(id) { return mongoose.Types.ObjectId.isValid(id); }

async function populateTimetable(query) {
  return query.populate('classSectionId', 'grade section').populate('periods.subjectId', 'name code').populate('periods.teacherId', 'name email').sort({ dayOfWeek: 1 });
}

function validPeriods(periods) {
  return Array.isArray(periods) && periods.every((period) => Number.isInteger(period.periodNumber) && period.periodNumber > 0 && validId(period.subjectId) && validId(period.teacherId));
}

export async function createTimetable(req, res) {
  try {
    const { classSectionId, dayOfWeek, periods } = req.body;
    if (!validId(classSectionId) || !(await ClassSection.exists({ _id: classSectionId }))) return response(res, 404, 'Class-section not found');
    if (!['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(dayOfWeek) || !validPeriods(periods)) return response(res, 400, 'A valid day and periods are required');
    const subjectIds = periods.map((period) => period.subjectId);
    const teacherIds = periods.map((period) => period.teacherId);
    if (await Subject.countDocuments({ _id: { $in: subjectIds } }) !== new Set(subjectIds).size) return response(res, 400, 'One or more subjects do not exist');
    if (await User.countDocuments({ _id: { $in: teacherIds }, role: 'teacher' }) !== new Set(teacherIds).size) return response(res, 400, 'Every timetable teacher must be a teacher user');
    const timetable = await Timetable.findOneAndUpdate({ classSectionId, dayOfWeek }, { $set: { periods } }, { new: true, upsert: true, runValidators: true });
    return response(res, 200, 'Timetable saved', await populateTimetable(Timetable.findById(timetable._id)));
  } catch (error) {
    return response(res, error.code === 11000 ? 409 : 500, error.code === 11000 ? 'Timetable already exists for this class and day' : 'Unable to save timetable', error.code === 11000 ? undefined : error.message);
  }
}

export async function listAdminTimetable(req, res) {
  try {
    if (!validId(req.query.classSectionId)) return response(res, 400, 'A valid classSectionId is required');
    return response(res, 200, 'Timetable loaded', await populateTimetable(Timetable.find({ classSectionId: req.query.classSectionId })));
  } catch (error) { return response(res, 500, 'Unable to load timetable', error.message); }
}

export async function listTeacherTimetable(req, res) {
  try {
    const classes = await ClassSection.find({ classTeacherId: req.user.userId }).select('_id');
    return response(res, 200, 'Timetable loaded', await populateTimetable(Timetable.find({ classSectionId: { $in: classes.map((item) => item._id) } })));
  } catch (error) { return response(res, 500, 'Unable to load timetable', error.message); }
}

export async function listStudentTimetable(req, res) {
  try {
    const student = await Student.findOne({ userId: req.user.userId }).select('classSectionId');
    if (!student) return response(res, 404, 'Student profile not found');
    return response(res, 200, 'Timetable loaded', await populateTimetable(Timetable.find({ classSectionId: student.classSectionId })));
  } catch (error) { return response(res, 500, 'Unable to load timetable', error.message); }
}

export async function createTeacherTimetable(req, res) {
  try {
    const { classSectionId, dayOfWeek, periods } = req.body;
    if (!validId(classSectionId) || !(await ClassSection.exists({ _id: classSectionId, classTeacherId: req.user.userId }))) return response(res, 403, 'You can only edit timetables for your assigned classes');
    if (!['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(dayOfWeek) || !Array.isArray(periods) || !periods.length) return response(res, 400, 'A valid day and at least one period are required');

    const normalizedPeriods = [];
    for (const period of periods) {
      if (!Number.isInteger(period.periodNumber) || period.periodNumber < 1) return response(res, 400, 'Every period needs a positive period number');
      let subjectId = period.subjectId;
      if (!validId(subjectId)) {
        if (!period.subjectName?.trim() || !period.subjectCode?.trim()) return response(res, 400, 'Each new subject needs a name and code');
        const subject = await Subject.findOneAndUpdate(
          { code: period.subjectCode.trim().toUpperCase() },
          { $set: { name: period.subjectName.trim() }, $setOnInsert: { code: period.subjectCode.trim().toUpperCase() } },
          { new: true, upsert: true, runValidators: true },
        );
        subjectId = subject._id;
      } else if (!(await Subject.exists({ _id: subjectId }))) {
        return response(res, 400, 'One or more subjects do not exist');
      }
      normalizedPeriods.push({ periodNumber: period.periodNumber, subjectId, teacherId: req.user.userId });
    }
    if (new Set(normalizedPeriods.map((period) => period.periodNumber)).size !== normalizedPeriods.length) return response(res, 400, 'Period numbers must be unique for a day');
    const timetable = await Timetable.findOneAndUpdate({ classSectionId, dayOfWeek }, { $set: { periods: normalizedPeriods } }, { new: true, upsert: true, runValidators: true });
    return response(res, 200, 'Timetable saved', await populateTimetable(Timetable.findById(timetable._id)));
  } catch (error) {
    return response(res, error.code === 11000 ? 409 : 500, error.code === 11000 ? 'Timetable already exists for this class and day' : 'Unable to save timetable', error.code === 11000 ? undefined : error.message);
  }
}