import express from 'express';
import { verifyToken, authorizeRoles } from '../../../middleware/auth.middleware.js';
import {
    getSchoolInfo,
    createSchoolInfo,
    updateSchoolInfo,
    deleteSchoolInfo,
} from './schoolInfo.controller.js';

const router = express.Router();
router.get('/', getSchoolInfo);

router.post('/', verifyToken, authorizeRoles('super', 'admin'), createSchoolInfo);

router.put('/:id', verifyToken, authorizeRoles('super', 'admin'), updateSchoolInfo);

router.delete('/:id', verifyToken, authorizeRoles('super', 'admin'), deleteSchoolInfo);

export default router;