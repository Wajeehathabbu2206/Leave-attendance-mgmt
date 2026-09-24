import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getTeacherAttendance, listTeacherClasses, saveAttendance } from '../controllers/attendance.controller.js';
import { listTeacherLeaves, reviewLeave } from '../controllers/leave.controller.js';
import { getTeacherBalances } from '../controllers/leaveBalance.controller.js';
import { teacherAttendanceReport, teacherDashboard } from '../controllers/dashboard.controller.js';

const router = Router();
router.use(authenticate, authorize('teacher'));
router.get('/classes', listTeacherClasses);
router.get('/attendance', getTeacherAttendance);
router.post('/attendance', saveAttendance);
router.get('/leave', listTeacherLeaves);
router.patch('/leave/:id', reviewLeave);
router.get('/leave-balance', getTeacherBalances);
router.get('/dashboard', teacherDashboard);
router.get('/reports/attendance', teacherAttendanceReport);

export default router;