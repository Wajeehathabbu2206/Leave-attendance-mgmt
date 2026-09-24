import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getTeacherAttendance, listTeacherClasses, saveAttendance } from '../controllers/attendance.controller.js';
import { listTeacherLeaves, reviewLeave } from '../controllers/leave.controller.js';

const router = Router();
router.use(authenticate, authorize('teacher'));
router.get('/classes', listTeacherClasses);
router.get('/attendance', getTeacherAttendance);
router.post('/attendance', saveAttendance);
router.get('/leave', listTeacherLeaves);
router.patch('/leave/:id', reviewLeave);

export default router;