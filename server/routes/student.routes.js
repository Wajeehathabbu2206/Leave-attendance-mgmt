import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getStudentAttendance } from '../controllers/attendance.controller.js';

const router = Router();
router.use(authenticate, authorize('student'));
router.get('/attendance', getStudentAttendance);

export default router;