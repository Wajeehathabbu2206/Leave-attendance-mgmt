import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getParentAttendance, listParentChildren } from '../controllers/attendance.controller.js';
import { listParentLeaves } from '../controllers/leave.controller.js';

const router = Router();
router.use(authenticate, authorize('parent'));
router.get('/children', listParentChildren);
router.get('/attendance', getParentAttendance);
router.get('/leave', listParentLeaves);

export default router;