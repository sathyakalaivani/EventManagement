import express from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
