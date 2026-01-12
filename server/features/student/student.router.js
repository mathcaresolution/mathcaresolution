import { Router } from 'express';
import { verifyToken, authorizeRoles } from '../../middleware/auth.middleware.js';
import { createStudent, getAllStudents, getStudentById, updateStudentById, deleteStudentById, studentAdmission, approveAdmission} from './student.controller.js';

const router = Router();

// Only Super, Admin, or Desk can create students
router.post('/create', verifyToken, authorizeRoles('super', 'admin'), createStudent);
router.get('/all', verifyToken, authorizeRoles('super', 'admin', 'desk'), getAllStudents);
router.post('/admission', studentAdmission)
router.put('/approve/:id', verifyToken, authorizeRoles('super', 'admin'), approveAdmission)
router.get('/:id', verifyToken, authorizeRoles('super', 'admin', 'desk', 'student'), getStudentById);
router.put('/:id', verifyToken, authorizeRoles('super', 'admin', 'desk', 'student'), updateStudentById);
router.delete('/:id', verifyToken, authorizeRoles('super', 'admin'), deleteStudentById)

export default router;