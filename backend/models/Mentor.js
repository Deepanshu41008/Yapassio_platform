const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  active: { type: Boolean, default: true },
  headline: { type: String, required: true },
  bio: { type: String },

  profile: {
    profilePicture: { type: String },
    company: { type: String },
    jobTitle: { type: String },
    website: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
  },

  location: {
    city: { type: String },
    state: { type: String },
    country: { type: String },
    willingToMentorRemotely: { type: Boolean, default: true },
  },

  expertise: {
    domains: [{ type: String }],
    skills: [{ type: String }],
    yearsOfExperience: { type: Number, default: 0 },
  },

  mentorship: {
    availability: { type: String },
    communicationChannels: [{ type: String }], // e.g., 'Zoom', 'Slack'
  },

  pricing: {
    isFree: { type: Boolean, default: true },
    sessionRate: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
  },

  verification: {
    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    verificationMethod: { type: String },
    verificationDocuments: [{ type: String }],
  },

  stats: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
  },

  joinedDate: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
});

const Mentor = mongoose.model('Mentor', mentorSchema);
module.exports = Mentor;
