import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getTeacherAttendance, listTeacherClasses, saveAttendance, savePeriodAttendance } from '../controllers/attendance.controller.js';
import { listTeacherLeaves, reviewLeave } from '../controllers/leave.controller.js';
import { getTeacherBalances } from '../controllers/leaveBalance.controller.js';
import { teacherAttendanceReport, teacherDashboard } from '../controllers/dashboard.controller.js';
import { listTeacherTimetable } from '../controllers/timetable.controller.js';

const router = Router();
router.use(authenticate, authorize('teacher'));
router.get('/classes', listTeacherClasses);
router.get('/attendance', getTeacherAttendance);
router.post('/attendance', saveAttendance);
router.post('/attendance/period', savePeriodAttendance);
router.get('/leave', listTeacherLeaves);
router.patch('/leave/:id', reviewLeave);
router.get('/leave-balance', getTeacherBalances);
router.get('/dashboard', teacherDashboard);
router.get('/reports/attendance', teacherAttendanceReport);
router.get('/timetable', listTeacherTimetable);

export default router;