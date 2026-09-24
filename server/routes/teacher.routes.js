import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getTeacherAttendance, listTeacherClasses, saveAttendance } from '../controllers/attendance.controller.js';

const router = Router();
router.use(authenticate, authorize('teacher'));
router.get('/classes', listTeacherClasses);
router.get('/attendance', getTeacherAttendance);
router.post('/attendance', saveAttendance);

export default router;