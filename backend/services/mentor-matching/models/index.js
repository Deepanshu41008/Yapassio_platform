const mongoose = require('mongoose');

// Mentor Schema
const mentorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  profile: {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    profilePicture: { type: String },
    bio: { type: String, maxLength: 500 },
    linkedIn: { type: String },
    website: { type: String }
  },
  expertise: {
    domains: [{ 
      type: String, 
      enum: ['technology', 'business', 'healthcare', 'education', 'finance', 'arts', 
             'engineering', 'law', 'science', 'marketing', 'entrepreneurship', 'other']
    }],
    skills: [String],
    industries: [String],
    yearsOfExperience: { type: Number, required: true }
  },
  background: {
    currentRole: { type: String },
    company: { type: String },
    education: [{
      degree: String,
      institution: String,
      year: Number
    }],
    certifications: [String],
    achievements: [String]
  },
  mentorship: {
    availability: {
      hoursPerWeek: { type: Number, default: 2 },
      preferredDays: [String],
      preferredTimes: [String],
      timezone: { type: String }
    },
    preferences: {
      menteeLevel: [{ 
        type: String, 
        enum: ['student', 'fresher', 'junior', 'mid-level', 'senior'] 
      }],
      menteeGoals: [String],
      communicationModes: [{ 
        type: String, 
        enum: ['video', 'audio', 'chat', 'email', 'in-person'] 
      }],
      languages: [String]
    },
    style: {
      approach: { 
        type: String, 
        enum: ['structured', 'flexible', 'goal-oriented', 'exploratory'] 
      },
      specializations: [String]
    }
  },
  location: {
    country: { type: String, required: true },
    state: { type: String },
    city: { type: String },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    willingToMentorRemotely: { type: Boolean, default: true }
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    verificationMethod: { 
      type: String, 
      enum: ['email', 'linkedin', 'document', 'reference', 'admin'] 
    },
    verificationDocuments: [String]
  },
  stats: {
    totalMentees: { type: Number, default: 0 },
    activeMentees: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    responseRate: { type: Number, default: 100 },
    responseTime: { type: Number, default: 24 } // in hours
  },
  pricing: {
    isFree: { type: Boolean, default: true },
    hourlyRate: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    packageDeals: [{
      name: String,
      sessions: Number,
      price: Number,
      duration: Number // in weeks
    }]
  },
  active: { type: Boolean, default: true },
  joinedDate: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

// Student/Mentee Schema
const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  profile: {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    profilePicture: { type: String },
    bio: { type: String, maxLength: 500 },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] }
  },
  education: {
    currentLevel: { 
      type: String, 
      enum: ['high-school', 'undergraduate', 'postgraduate', 'phd', 'professional', 'other'] 
    },
    institution: { type: String },
    major: { type: String },
    expectedGraduation: { type: Date },
    gpa: { type: Number },
    achievements: [String]
  },
  career: {
    interests: [String],
    targetDomains: [String],
    targetRoles: [String],
    currentStatus: { 
      type: String, 
      enum: ['student', 'job-seeking', 'employed', 'freelancing', 'entrepreneur'] 
    },
    experience: [{
      role: String,
      company: String,
      duration: String,
      description: String
    }],
    skills: [String],
    portfolioUrl: { type: String }
  },
  goals: {
    shortTerm: [String], // 3-6 months
    mediumTerm: [String], // 6-12 months
    longTerm: [String], // 1-5 years
    challenges: [String],
    learningObjectives: [String]
  },
  preferences: {
    mentorType: [{ 
      type: String, 
      enum: ['industry', 'academic', 'entrepreneur', 'government', 'any'] 
    }],
    mentorExperience: { 
      type: String, 
      enum: ['5+', '10+', '15+', '20+', 'any'] 
    },
    communicationMode: [{ 
      type: String, 
      enum: ['video', 'audio', 'chat', 'email', 'in-person'] 
    }],
    sessionFrequency: { 
      type: String, 
      enum: ['weekly', 'bi-weekly', 'monthly', 'as-needed'] 
    },
    languages: [String]
  },
  location: {
    country: { type: String, required: true },
    state: { type: String },
    city: { type: String },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    openToRemote: { type: Boolean, default: true }
  },
  mentorshipHistory: [{
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
    startDate: Date,
    endDate: Date,
    status: { 
      type: String, 
      enum: ['active', 'completed', 'paused', 'terminated'] 
    },
    feedback: String,
    rating: Number
  }],
  communityGroups: [{
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
    joinedDate: Date,
    role: { type: String, enum: ['member', 'moderator', 'admin'] }
  }],
  active: { type: Boolean, default: true },
  joinedDate: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

// Community/Peer Group Schema
const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['study-group', 'peer-circle', 'project-team', 'interest-group', 'location-based'] 
  },
  category: {
    domain: { type: String, required: true },
    subDomains: [String],
    tags: [String]
  },
  location: {
    isLocationBased: { type: Boolean, default: false },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    isOnline: { type: Boolean, default: true }
  },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId },
    userType: { type: String, enum: ['student', 'mentor', 'professional'] },
    role: { type: String, enum: ['member', 'moderator', 'admin'] },
    joinedDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }],
  settings: {
    maxMembers: { type: Number, default: 50 },
    isPublic: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    allowMentors: { type: Boolean, default: true },
    minActivityLevel: { type: Number, default: 1 } // posts per month
  },
  activities: {
    weeklyMeetings: { type: Boolean, default: false },
    meetingDay: { type: String },
    meetingTime: { type: String },
    meetingPlatform: { type: String },
    upcomingEvents: [{
      title: String,
      description: String,
      date: Date,
      type: { type: String, enum: ['meeting', 'workshop', 'study-session', 'networking'] },
      attendees: [mongoose.Schema.Types.ObjectId]
    }]
  },
  resources: [{
    title: String,
    type: { type: String, enum: ['document', 'video', 'link', 'course'] },
    url: String,
    uploadedBy: mongoose.Schema.Types.ObjectId,
    uploadedDate: Date
  }],
  stats: {
    totalMembers: { type: Number, default: 0 },
    activeMembers: { type: Number, default: 0 },
    totalPosts: { type: Number, default: 0 },
    totalEvents: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  active: { type: Boolean, default: true },
  createdDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Matching Request Schema
const matchingRequestSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  mentorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Mentor' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'expired'], 
    default: 'pending' 
  },
  matchScore: { type: Number }, // AI-calculated compatibility score
  matchFactors: {
    domainMatch: { type: Number },
    locationMatch: { type: Number },
    availabilityMatch: { type: Number },
    experienceMatch: { type: Number },
    goalAlignment: { type: Number }
  },
  message: { type: String },
  responseMessage: { type: String },
  expiresAt: { type: Date },
  respondedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Create indexes for better query performance
mentorSchema.index({ 'location.country': 1, 'location.city': 1 });
mentorSchema.index({ 'expertise.domains': 1 });
mentorSchema.index({ 'verification.isVerified': 1 });
mentorSchema.index({ 'stats.averageRating': -1 });

studentSchema.index({ 'location.country': 1, 'location.city': 1 });
studentSchema.index({ 'career.targetDomains': 1 });

communitySchema.index({ 'category.domain': 1 });
communitySchema.index({ 'location.city': 1 });

// Export models
module.exports = {
  Mentor: mongoose.model('Mentor', mentorSchema),
  Student: mongoose.model('Student', studentSchema),
  Community: mongoose.model('Community', communitySchema),
  MatchingRequest: mongoose.model('MatchingRequest', matchingRequestSchema)
};
