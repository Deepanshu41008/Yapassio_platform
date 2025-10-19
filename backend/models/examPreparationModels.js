const mongoose = require('mongoose');
const { Schema } = mongoose;

const examSchema = new Schema({
  exam_id: { type: String, required: true, unique: true, index: true },
  exam_name: { type: String, required: true },
  exam_type: { type: String, enum: ['competitive', 'proficiency', 'entrance'] },
  syllabus_topics: [{
    topic_id: String,
    topic_name: String,
    parent_topic: String,
    subtopics: [String],
    estimated_hours: Number
  }],
  exam_pattern: Object,
}, { timestamps: true });

const studyResourceSchema = new Schema({
  resource_id: { type: String, required: true, unique: true, index: true },
  exam_id: { type: String, required: true, index: true },
  topic: { type: String, index: true },
  title: String,
  type: { type: String, enum: ['video', 'pdf', 'practice'] },
  url: String,
  quality_score: Number,
  difficulty: String,
  duration_minutes: Number,
  ai_recommendation: String,
  provider: String,
}, { timestamps: true });

const studyPlanSchema = new Schema({
  study_plan_id: { type: String, required: true, unique: true, index: true },
  student_id: { type: String, required: true, index: true },
  exam_id: String,
  target_exam_date: Date,
  schedule: [{
    date: Date,
    topics: [Object],
    is_revision_day: Boolean,
    is_mock_test_day: Boolean
  }],
  milestones: [Object],
  ai_confidence_score: Number,
}, { timestamps: true });

const questionSchema = new Schema({
  question_id: { type: String, required: true, unique: true, index: true },
  exam_id: { type: String, required: true, index: true },
  topic: { type: String, required: true, index: true },
  text: String,
  options: [String],
  correct_answer: String,
  explanation: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  estimated_time_seconds: Number,
  source: { type: String, enum: ['ai_generated', 'manual'] },
}, { timestamps: true });

const studentAttemptSchema = new Schema({
  student_id: { type: String, required: true, index: true },
  question_id: String,
  exam_id: String,
  topic: String,
  is_correct: Boolean,
  time_taken_seconds: Number,
  attempted_at: { type: Date, default: Date.now }
});

const weakAreaReportSchema = new Schema({
  report_id: { type: String, required: true, unique: true, index: true },
  student_id: { type: String, required: true, index: true },
  exam_id: String,
  weak_topics: [{
    topic: String,
    accuracy_rate: Number,
    time_efficiency: Number,
    ai_root_cause_analysis: String,
    severity: { type: String, enum: ['high', 'medium', 'low'] }
  }],
  remedial_plan: Object,
  next_assessment_date: Date,
  generated_at: { type: Date, default: Date.now }
});

const mockTestSchema = new Schema({
  mock_test_id: { type: String, required: true, unique: true, index: true },
  exam_id: { type: String, required: true, index: true },
  test_type: String,
  test_config: Object,
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  generated_at: { type: Date, default: Date.now }
});

const mockTestSubmissionSchema = new Schema({
  submission_id: { type: String, required: true, unique: true, index: true },
  student_id: { type: String, required: true, index: true },
  mock_test_id: String,
  answers: [{
    question_id: String,
    student_answer: String,
    time_taken_seconds: Number
  }],
  score_summary: Object,
  question_wise_analysis: [Object],
  ai_performance_report: String,
  submitted_at: { type: Date, default: Date.now }
});

const Exam = mongoose.model('Exam', examSchema);
const StudyResource = mongoose.model('StudyResource', studyResourceSchema);
const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
const Question = mongoose.model('Question', questionSchema);
const StudentAttempt = mongoose.model('StudentAttempt', studentAttemptSchema);
const WeakAreaReport = mongoose.model('WeakAreaReport', weakAreaReportSchema);
const MockTest = mongoose.model('MockTest', mockTestSchema);
const MockTestSubmission = mongoose.model('MockTestSubmission', mockTestSubmissionSchema);

module.exports = { Exam, StudyResource, StudyPlan, Question, StudentAttempt, WeakAreaReport, MockTest, MockTestSubmission };
