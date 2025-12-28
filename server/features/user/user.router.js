import { Router } from 'express';
import { verifyToken, authorizeRoles } from '../../middleware/auth.middleware.js';

import { createUser, loginUser, getAllUsers, getUser, updateUser, deleteUser, testUser } from './user.controller.js';

const router = Router();
router.get('/test', testUser);
router.get('/', verifyToken, authorizeRoles('super', 'admin'), getAllUsers);
router.get('/:id', verifyToken, getUser);
router.post('/', verifyToken, authorizeRoles('super', 'admin', 'desk'), createUser);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, authorizeRoles('super'), deleteUser);
router.post('/login', loginUser)


export default router;