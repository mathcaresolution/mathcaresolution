import express from 'express';
import { Router } from 'express';

import { createUser } from './user.controller.js';
import { getUser } from './user.controller.js';
import { updateUser } from './user.controller.js';
import { deleteUser } from './user.controller.js';
import { testUser } from './user.controller.js';

const router = Router();

router.get('/', getUser);
router.get('/test', testUser);
router.post('/', createUser);

export default router;