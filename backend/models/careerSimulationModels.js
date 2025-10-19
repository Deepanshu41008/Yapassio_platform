const mongoose = require('mongoose');
const { Schema } = mongoose;

const careerScenarioSchema = new Schema({
  scenario_id: { type: String, required: true, unique: true, index: true },
  career_track: { type: String, required: true, index: true },
  job_level: { type: String, enum: ['entry', 'junior', 'mid', 'senior'] },
  title: String,
  context: String,
  provided_artifacts: [Object],
  required_deliverables: [Object],
  evaluation_criteria: [Object],
  source: { type: String, enum: ['ai_generated', 'manual'] },
}, { timestamps: true });

const simulationSchema = new Schema({
  simulation_id: { type: String, required: true, unique: true, index: true },
  student_id: { type: String, required: true, index: true },
  scenario_id: String,
  started_at: { type: Date, default: Date.now },
  deadline: Date,
  submitted_at: Date,
  status: { type: String, enum: ['in_progress', 'submitted', 'evaluated'], default: 'in_progress' }
});

const simulationEvaluationSchema = new Schema({
  evaluation_id: { type: String, required: true, unique: true, index: true },
  simulation_id: { type: String, required: true, index: true },
  student_id: String,
  overall_score: Number,
  performance_level: { type: String, enum: ['Outstanding', 'Excellent', 'Good', 'Needs Improvement', 'Poor'] },
  dimension_scores: Object,
  detailed_feedback: String,
  benchmarking: Object,
  evaluated_at: { type: Date, default: Date.now }
});

const rolePlayConversationSchema = new Schema({
    conversation_id: { type: String, required: true, unique: true, index: true },
    student_id: { type: String, required: true, index: true },
    scenario_type: String,
    character_description: String,
    conversation_history: [{
        turn: Number,
        speaker: String,
        message: String,
        timestamp: Date
    }],
    performance_metrics: Object,
    ai_conversation_analysis: String,
    completed_at: Date
});

const CareerScenario = mongoose.model('CareerScenario', careerScenarioSchema);
const Simulation = mongoose.model('Simulation', simulationSchema);
const SimulationEvaluation = mongoose.model('SimulationEvaluation', simulationEvaluationSchema);
const RolePlayConversation = mongoose.model('RolePlayConversation', rolePlayConversationSchema);

module.exports = { CareerScenario, Simulation, SimulationEvaluation, RolePlayConversation };
