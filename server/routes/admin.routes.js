import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  createClass,
  createParent,
  createStudent,
  createTeacher,
  listClasses,
  listStudents,
  listTeachers,
  updateClass,
} from '../controllers/admin.controller.js';
import { setLeaveBalances } from '../controllers/leaveBalance.controller.js';
import { adminDashboard } from '../controllers/dashboard.controller.js';

const router = Router();
router.use(authenticate, authorize('admin'));
router.get('/teachers', listTeachers);
router.post('/classes', createClass);
router.get('/classes', listClasses);
router.put('/classes/:id', updateClass);
router.post('/teachers', createTeacher);
router.post('/students', createStudent);
router.get('/students', listStudents);
router.post('/parents', createParent);
router.post('/leave-balance/set', setLeaveBalances);
router.get('/dashboard', adminDashboard);

export default router;