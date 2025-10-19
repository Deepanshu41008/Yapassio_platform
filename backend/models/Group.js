const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  domain: { type: String, required: true },

  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
    joinedDate: { type: Date, default: Date.now }
  }],

  mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  settings: {
    isPublic: { type: Boolean, default: true },
    maxMembers: { type: Number, default: 100 }
  },

  stats: {
    totalMembers: { type: Number, default: 0 },
    activeMembers: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    totalEvents: { type: Number, default: 0 }
  },

  location: {
    city: { type: String },
    state: { type: String },
    country: { type: String },
    isOnline: { type: Boolean, default: true }
  },

  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
