import { Router } from 'express';
import { verifyToken, authorizeRoles } from '../../middleware/auth.middleware.js';
import { createStudent, getAllStudents, getStudentById, updateStudentById, deleteStudentById} from './student.controller.js';

const router = Router();

// Only Super, Admin, or Desk can create students
router.post('/create', verifyToken, authorizeRoles('super', 'admin', 'desk'), createStudent);
router.get('/all', verifyToken, authorizeRoles('super', 'admin', 'desk'), getAllStudents);
router.get('/:id', verifyToken, authorizeRoles('super', 'admin', 'desk', 'student'), getStudentById);
router.put('/:id', verifyToken, authorizeRoles('super', 'admin', 'desk'), updateStudentById);
router.delete('/:id', verifyToken, authorizeRoles('super', 'admin'), deleteStudentById)

export default router;