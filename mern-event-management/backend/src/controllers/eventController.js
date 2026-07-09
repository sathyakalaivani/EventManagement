import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';
import ApiError from '../utils/ApiError.js';
import { deleteFromS3 } from '../config/s3.js';

// @desc    Get all events (with search, filter, pagination)
// @route   GET /api/events
// @access  Public
export const getEvents = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    city,
    status,
    upcoming,
    page = 1,
    limit = 12,
    sort = '-date',
  } = req.query;

  const query = {};

  if (search) {
    query.$text = { $search: search };
  }
  if (category) query.category = category;
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (status) query.status = status;
  else query.status = { $ne: 'draft' };
  if (upcoming === 'true') query.date = { $gte: new Date() };

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const total = await Event.countDocuments(query);
  const events = await Event.find(query)
    .populate('organizer', 'name email')
    .sort(sort)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: events.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    events,
  });
});

// @desc    Get single event by id
// @route   GET /api/events/:id
// @access  Public
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'name email')
    .populate('attendees.user', 'name email');

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  res.status(200).json({ success: true, event });
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = asyncHandler(async (req, res) => {
  const eventData = { ...req.body, organizer: req.user._id };

  if (req.file) {
    eventData.image = { url: req.file.location, key: req.file.key };
  }

  const event = await Event.create(eventData);

  res.status(201).json({ success: true, message: 'Event created successfully', event });
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  Object.assign(event, req.body);

  if (req.file) {
    if (event.image?.key) {
      await deleteFromS3(event.image.key);
    }
    event.image = { url: req.file.location, key: req.file.key };
  }

  await event.save();

  res.status(200).json({ success: true, message: 'Event updated successfully', event });
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  if (event.image?.key) {
    await deleteFromS3(event.image.key);
  }

  await event.deleteOne();

  res.status(200).json({ success: true, message: 'Event deleted successfully' });
});

// @desc    Register the current user as an attendee
// @route   POST /api/events/:id/register
// @access  Private
export const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  if (event.status !== 'published') {
    throw new ApiError(400, 'This event is not open for registration');
  }

  const alreadyRegistered = event.attendees.some(
    (a) => String(a.user) === String(req.user._id)
  );
  if (alreadyRegistered) {
    throw new ApiError(409, 'You are already registered for this event');
  }

  if (event.attendees.length >= event.capacity) {
    throw new ApiError(400, 'This event has reached full capacity');
  }

  event.attendees.push({ user: req.user._id });
  await event.save();

  res.status(200).json({ success: true, message: 'Registered successfully', event });
});

// @desc    Cancel the current user's registration
// @route   DELETE /api/events/:id/register
// @access  Private
export const unregisterFromEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  event.attendees = event.attendees.filter(
    (a) => String(a.user) !== String(req.user._id)
  );
  await event.save();

  res.status(200).json({ success: true, message: 'Registration cancelled', event });
});

// @desc    Get events the current user created (admin) or registered for
// @route   GET /api/events/mine
// @access  Private
export const getMyEvents = asyncHandler(async (req, res) => {
  let events;
  if (req.user.role === 'admin') {
    events = await Event.find({ organizer: req.user._id }).sort('-createdAt');
  } else {
    events = await Event.find({ 'attendees.user': req.user._id }).sort('-date');
  }

  res.status(200).json({ success: true, count: events.length, events });
});
