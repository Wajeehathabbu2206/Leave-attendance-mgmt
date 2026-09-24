import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getStudentAttendance } from '../controllers/attendance.controller.js';
import { createLeave, listStudentLeaves } from '../controllers/leave.controller.js';

const router = Router();
router.use(authenticate, authorize('student'));
router.get('/attendance', getStudentAttendance);
router.post('/leave', createLeave);
router.get('/leave', listStudentLeaves);

export default router;