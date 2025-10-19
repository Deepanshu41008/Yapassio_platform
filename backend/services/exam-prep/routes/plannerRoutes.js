const express = require('express');
const router = express.Router();
const { protect } = require('../../../middleware/authMiddleware');
const PlannerEvent = require('../../../models/PlannerEvent');

// @desc    Create a new planner event
// @route   POST /api/exams/planner
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, startTime, endTime, eventType, exam } = req.body;
    const event = new PlannerEvent({
      user: req.user.id,
      title,
      description,
      startTime,
      endTime,
      eventType,
      exam,
    });
    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all planner events for a user
// @route   GET /api/exams/planner
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const events = await PlannerEvent.find({ user: req.user.id }).sort({ startTime: 'asc' });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a planner event
// @route   PUT /api/exams/planner/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, startTime, endTime, eventType, isCompleted, exam } = req.body;
    const event = await PlannerEvent.findById(req.params.id);

    if (event && event.user.toString() === req.user.id) {
      event.title = title || event.title;
      event.description = description || event.description;
      event.startTime = startTime || event.startTime;
      event.endTime = endTime || event.endTime;
      event.eventType = eventType || event.eventType;
      event.isCompleted = isCompleted !== undefined ? isCompleted : event.isCompleted;
      event.exam = exam || event.exam;

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found or user not authorized' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a planner event
// @route   DELETE /api/exams/planner/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await PlannerEvent.findById(req.params.id);
    if (event && event.user.toString() === req.user.id) {
      await event.remove();
      res.json({ message: 'Event removed' });
    } else {
      res.status(404).json({ message: 'Event not found or user not authorized' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
