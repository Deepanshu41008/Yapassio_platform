const mongoose = require('mongoose');

// Exam Schema - Main exam information
const examSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    enum: ['UPSC', 'NEET', 'JEE', 'GATE', 'CAT', 'TOEFL', 'IELTS', 'GRE', 'GMAT', 'SSC', 'Banking', 'Railways', 'Defence', 'State PSC', 'Other']
  },
  fullName: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: ['Government', 'Engineering', 'Medical', 'Management', 'Language', 'Defence', 'Other']
  },
  eligibility: {
    minimumEducation: String,
    ageLimit: {
      min: Number,
      max: Number
    },
    otherRequirements: [String]
  },
  examPattern: {
    mode: { type: String, enum: ['Online', 'Offline', 'Both'] },
    stages: [{
      name: String,
      description: String,
      duration: String,
      totalMarks: Number,
      passingMarks: Number
    }],
    subjects: [{
      name: String,
      weightage: Number,
      topics: [String],
      recommendedBooks: [String]
    }],
    negativeMarking: { type: Boolean, default: false },
    negativeMarkingDetails: String
  },
  schedule: {
    registrationStartDate: Date,
    registrationEndDate: Date,
    examDates: [Date],
    resultDate: Date,
    officialWebsite: String
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Hard', 'Very Hard']
  },
  averagePreparationTime: String, // e.g., "6-8 months"
  successRate: Number, // Percentage
  totalApplicants: Number,
  totalSeats: Number,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Study Resource Schema
const resourceSchema = new mongoose.Schema({
  examId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exam',
    required: true 
  },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['Book', 'Video', 'PDF', 'Website', 'Course', 'Mock Test', 'Previous Papers', 'Notes', 'Article'],
    required: true
  },
  subject: String,
  topic: String,
  description: String,
  url: String,
  author: String,
  source: String,
  language: { type: String, default: 'English' },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  tags: [String],
  isFree: { type: Boolean, default: true },
  price: {
    amount: Number,
    currency: { type: String, default: 'INR' }
  },
  aiCurated: { type: Boolean, default: false },
  aiScore: Number, // AI quality score 0-100
  metadata: {
    fileSize: String,
    duration: String, // For videos
    pages: Number, // For PDFs/books
    lastUpdated: Date
  },
  analytics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 }
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Practice Question Schema
const questionSchema = new mongoose.Schema({
  examId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exam',
    required: true 
  },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  type: {
    type: String,
    enum: ['MCQ', 'Multiple Select', 'True/False', 'Fill in Blank', 'Numerical', 'Descriptive'],
    required: true
  },
  question: { type: String, required: true },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: String,
  explanation: String,
  solution: String,
  hints: [String],
  marks: { type: Number, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  timeLimit: Number, // in seconds
  tags: [String],
  yearAsked: [Number], // Years when this question appeared
  source: String, // e.g., "GATE 2020", "JEE Main 2021"
  imageUrl: String, // For questions with diagrams
  statistics: {
    attempted: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    avgTime: { type: Number, default: 0 }, // in seconds
    difficulty: { type: Number, default: 0 } // Calculated difficulty 0-100
  },
  aiGenerated: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Study Plan Schema
const studyPlanSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true 
  },
  examId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exam',
    required: true 
  },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Custom'],
    default: 'Daily'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  targetExamDate: Date,
  dailyStudyHours: { type: Number, default: 4 },
  schedule: [{
    date: Date,
    day: String,
    tasks: [{
      time: String,
      duration: Number, // in minutes
      subject: String,
      topic: String,
      type: { 
        type: String, 
        enum: ['Theory', 'Practice', 'Revision', 'Mock Test', 'Break'] 
      },
      description: String,
      resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
      completed: { type: Boolean, default: false },
      completedAt: Date,
      notes: String
    }],
    totalHours: Number,
    completed: { type: Boolean, default: false }
  }],
  subjects: [{
    name: String,
    priority: { type: String, enum: ['High', 'Medium', 'Low'] },
    targetCompletion: Date,
    progress: { type: Number, default: 0 }, // Percentage
    topics: [{
      name: String,
      estimatedHours: Number,
      actualHours: Number,
      completed: { type: Boolean, default: false }
    }]
  }],
  milestones: [{
    title: String,
    date: Date,
    type: { type: String, enum: ['Syllabus Completion', 'Mock Test', 'Revision', 'Other'] },
    description: String,
    achieved: { type: Boolean, default: false },
    achievedDate: Date
  }],
  reminders: [{
    type: { type: String, enum: ['Study', 'Test', 'Revision', 'Registration', 'Other'] },
    time: String,
    message: String,
    enabled: { type: Boolean, default: true }
  }],
  analytics: {
    totalStudyHours: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    lastStudyDate: Date
  },
  aiOptimized: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// User Progress Schema
const userProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true 
  },
  examId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exam',
    required: true 
  },
  overallProgress: { type: Number, default: 0 }, // Percentage
  subjectProgress: [{
    subject: String,
    progress: Number, // Percentage
    strongTopics: [String],
    weakTopics: [String],
    lastStudied: Date
  }],
  practiceStats: {
    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // Percentage
    avgTimePerQuestion: { type: Number, default: 0 }, // seconds
    questionsToday: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }
  },
  mockTests: [{
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest' },
    date: Date,
    score: Number,
    percentile: Number,
    rank: Number,
    timeTaken: Number, // minutes
    analysis: {
      strong: [String],
      weak: [String],
      recommendations: [String]
    }
  }],
  weakAreas: [{
    subject: String,
    topic: String,
    accuracy: Number,
    lastPracticed: Date,
    improvementPlan: String,
    priority: { type: String, enum: ['High', 'Medium', 'Low'] }
  }],
  remedyPlans: [{
    weakArea: String,
    plan: String,
    resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
    targetDate: Date,
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'] },
    progress: { type: Number, default: 0 }
  }],
  predictions: {
    expectedScore: Number,
    expectedPercentile: Number,
    passProbability: Number, // 0-100
    readinessScore: Number, // 0-100
    recommendedExamDate: Date,
    lastUpdated: Date
  },
  studyTime: {
    total: { type: Number, default: 0 }, // minutes
    thisWeek: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    dailyAverage: { type: Number, default: 0 }
  },
  achievements: [{
    type: String,
    title: String,
    description: String,
    earnedDate: Date,
    icon: String
  }],
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Mock Test Schema
const mockTestSchema = new mongoose.Schema({
  examId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exam',
    required: true 
  },
  title: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ['Full Length', 'Subject Wise', 'Topic Wise', 'Previous Year'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  duration: { type: Number, required: true }, // in minutes
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  passingMarks: Number,
  subjects: [{
    name: String,
    questions: Number,
    marks: Number
  }],
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  instructions: [String],
  attemptsAllowed: { type: Number, default: -1 }, // -1 for unlimited
  negativeMarking: { type: Boolean, default: false },
  negativeMarkingScheme: String,
  scheduledDate: Date,
  availableFrom: Date,
  availableTill: Date,
  analytics: {
    totalAttempts: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    avgTime: { type: Number, default: 0 },
    topScore: Number,
    topScorer: String
  },
  aiGenerated: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Test Attempt Schema
const testAttemptSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true 
  },
  mockTestId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MockTest',
    required: true 
  },
  startTime: { type: Date, required: true },
  endTime: Date,
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Abandoned'],
    default: 'In Progress'
  },
  responses: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answer: String,
    isCorrect: Boolean,
    timeTaken: Number, // seconds
    marksObtained: Number
  }],
  score: Number,
  percentage: Number,
  rank: Number,
  percentile: Number,
  analysis: {
    correct: Number,
    incorrect: Number,
    unattempted: Number,
    accuracy: Number,
    subjectWise: [{
      subject: String,
      attempted: Number,
      correct: Number,
      score: Number,
      accuracy: Number
    }],
    difficultyWise: {
      easy: { attempted: Number, correct: Number },
      medium: { attempted: Number, correct: Number },
      hard: { attempted: Number, correct: Number }
    },
    timeAnalysis: {
      totalTime: Number,
      avgTimePerQuestion: Number,
      fastestQuestion: Number,
      slowestQuestion: Number
    }
  },
  feedback: {
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    aiGeneratedTips: [String]
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Create indexes for better performance
examSchema.index({ name: 1, category: 1 });
resourceSchema.index({ examId: 1, type: 1, subject: 1 });
questionSchema.index({ examId: 1, subject: 1, topic: 1, difficulty: 1 });
studyPlanSchema.index({ userId: 1, examId: 1 });
userProgressSchema.index({ userId: 1, examId: 1 });
mockTestSchema.index({ examId: 1, type: 1 });
testAttemptSchema.index({ userId: 1, mockTestId: 1 });

// Export models
module.exports = {
  Exam: mongoose.model('Exam', examSchema),
  Resource: mongoose.model('Resource', resourceSchema),
  Question: mongoose.model('Question', questionSchema),
  StudyPlan: mongoose.model('StudyPlan', studyPlanSchema),
  UserProgress: mongoose.model('UserProgress', userProgressSchema),
  MockTest: mongoose.model('MockTest', mockTestSchema),
  TestAttempt: mongoose.model('TestAttempt', testAttemptSchema)
};
