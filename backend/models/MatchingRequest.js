const mongoose = require('mongoose');

const matchingRequestSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending',
  },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  respondedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const MatchingRequest = mongoose.model('MatchingRequest', matchingRequestSchema);
module.exports = MatchingRequest;
