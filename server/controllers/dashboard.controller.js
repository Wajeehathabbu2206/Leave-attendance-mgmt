import Attendance from '../models/Attendance.js';
import ClassSection from '../models/ClassSection.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

function response(res, status, message, data) {
  return res.status(status).json({ success: status < 400, message, ...(data === undefined ? {} : { data }) });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function monthRange(month, year) {
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12 || !Number.isInteger(yearNumber) || yearNumber < 2000 || yearNumber > 2100) return null;
  const prefix = `${yearNumber}-${String(monthNumber).padStart(2, '0')}-`;
  return { $regex: `^${prefix}` };
}

async function assignedClass(classSectionId, teacherId) {
  return ClassSection.findOne({ _id: classSectionId, classTeacherId: teacherId });
}

export async function teacherDashboard(req, res) {
  try {
    const classSection = await assignedClass(req.query.classSectionId, req.user.userId);
    if (!classSection) return response(res, 403, 'You can only view your assigned class dashboard');
    const date = today();
    const [totalStudents, records, pendingLeaveRequests] = await Promise.all([
      Student.countDocuments({ classSectionId: classSection._id }),
      Attendance.find({ classSectionId: classSection._id, date, periodNumber: null }).select('status'),
      LeaveRequest.countDocuments({ classSectionId: classSection._id, status: 'pending' }),
    ]);
    const attendanceSummary = { present: 0, absent: 0, late: 0, leave: 0 };
    records.forEach((record) => { if (attendanceSummary[record.status] !== undefined) attendanceSummary[record.status] += 1; });
    return response(res, 200, 'Teacher dashboard loaded', { date, attendanceSummary, totalStudents, pendingLeaveRequests });
  } catch (error) {
    return response(res, 500, 'Unable to load teacher dashboard', error.message);
  }
}

export async function adminDashboard(req, res) {
  try {
    const date = today();
    const [totalStudents, totalTeachers, totalClasses, records, pendingLeaveRequests] = await Promise.all([
      Student.countDocuments(),
      User.countDocuments({ role: 'teacher' }),
      ClassSection.countDocuments(),
      Attendance.find({ date, periodNumber: null }).select('status'),
      LeaveRequest.countDocuments({ status: 'pending' }),
    ]);
    const totalMarked = records.length;
    const attended = records.filter((record) => record.status === 'present' || record.status === 'late').length;
    const attendanceSummary = { present: 0, absent: 0, late: 0, leave: 0 };
    records.forEach((record) => { if (attendanceSummary[record.status] !== undefined) attendanceSummary[record.status] += 1; });
    return response(res, 200, 'Admin dashboard loaded', { totalStudents, totalTeachers, totalClasses, totalMarked, attendanceSummary, overallAttendancePercentage: totalMarked ? Number(((attended / totalMarked) * 100).toFixed(2)) : 0, pendingLeaveRequests });
  } catch (error) {
    return response(res, 500, 'Unable to load admin dashboard', error.message);
  }
}

export async function teacherAttendanceReport(req, res) {
  try {
    const { classSectionId, month, year } = req.query;
    const classSection = await assignedClass(classSectionId, req.user.userId);
    if (!classSection) return response(res, 403, 'You can only export reports for your assigned class');
    const dateFilter = monthRange(month, year);
    if (!dateFilter) return response(res, 400, 'Valid month (1-12) and year are required');
    const students = await Student.find({ classSectionId }).populate('userId', 'name').sort({ rollNo: 1 });
    const records = await Attendance.find({ classSectionId, date: dateFilter }).select('studentId status');
    const byStudent = new Map();
    records.forEach((record) => { const key = record.studentId.toString(); if (!byStudent.has(key)) byStudent.set(key, []); byStudent.get(key).push(record.status); });
    const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = students.map((student) => {
      const statuses = byStudent.get(student._id.toString()) || [];
      const counts = { present: 0, absent: 0, late: 0, leave: 0 };
      statuses.forEach((status) => { if (counts[status] !== undefined) counts[status] += 1; });
      const percentage = statuses.length ? ((counts.present + counts.late) / statuses.length) * 100 : 0;
      return [student.userId?.name, student.rollNo, percentage.toFixed(2), counts.present, counts.absent, counts.late, counts.leave].map(escapeCsv).join(',');
    });
    const csv = ['Student Name,Roll No,Attendance %,Present Days,Absent Days,Late Days,Leave Days', ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.csv"');
    return res.send(csv);
  } catch (error) {
    return response(res, 500, 'Unable to export attendance report', error.message);
  }
}
