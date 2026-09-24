import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getStudentAttendance, getStudentAttendanceCalendar } from '../controllers/attendance.controller.js';
import { createLeave, listStudentLeaves } from '../controllers/leave.controller.js';
import { getStudentBalances } from '../controllers/leaveBalance.controller.js';
import { listStudentTimetable } from '../controllers/timetable.controller.js';
import { getStudentAttendanceAlerts } from '../controllers/rules.controller.js';

const router = Router();
router.use(authenticate, authorize('student'));
router.get('/attendance', getStudentAttendance);
router.get('/attendance/calendar', getStudentAttendanceCalendar);
router.get('/attendance/alerts', getStudentAttendanceAlerts);
router.post('/leave', createLeave);
router.get('/leave', listStudentLeaves);
router.get('/leave-balance', getStudentBalances);
router.get('/timetable', listStudentTimetable);

export default router;