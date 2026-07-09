import express from 'express';
import { body } from 'express-validator';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getMyEvents,
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadEventImage } from '../middleware/uploadMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('A valid date is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
  body('location.venue').notEmpty().withMessage('Venue is required'),
  body('location.city').notEmpty().withMessage('City is required'),
];

router.get('/', getEvents);
router.get('/mine', protect, getMyEvents);
router.get('/:id', getEventById);

router.post(
  '/',
  protect,
  authorize('admin'),
  uploadEventImage,
  eventValidation,
  validateRequest,
  createEvent
);

router.put('/:id', protect, authorize('admin'), uploadEventImage, updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, unregisterFromEvent);

export default router;
