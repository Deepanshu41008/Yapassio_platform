const mongoose = require('mongoose');

const plannerEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  eventType: {
    type: String,
    enum: ['Study Session', 'Mock Exam', 'Topic Review', 'Reminder'],
    default: 'Study Session',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  exam: { // To associate the event with a specific exam
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

plannerEventSchema.index({ user: 1, startTime: 1 });

const PlannerEvent = mongoose.model('PlannerEvent', plannerEventSchema);

module.exports = PlannerEvent;
