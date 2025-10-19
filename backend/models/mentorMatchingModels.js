const mongoose = require('mongoose');
const { Schema } = mongoose;

const mentorSchema = new Schema({
  mentor_id: { type: String, required: true, unique: true, index: true },
  user_id: { type: String, required: true, index: true },
  mentor_type: { type: String, enum: ['academia', 'civil_service', 'industry', 'entrepreneur'], required: true },
  domains: { type: [String], required: true },
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }
    }
  },
  availability_hours_per_week: { type: Number, required: true },
  preferred_time_slots: [String],
  expertise_level: { type: String, enum: ['junior', 'mid', 'senior', 'expert'], required: true },
  years_of_experience: { type: Number, required: true },
  bio: { type: String, required: true, maxlength: 500 },
  languages: { type: [String], required: true },
  max_mentees: { type: Number, required: true, default: 1 },
  current_mentees_count: { type: Number, default: 0 },
  verification_status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
  profile_embedding: {
    type: [Number],
    index: {
      type: 'vectorSearch',
      options: {
        dimensions: 768,
        similarity: 'cosine'
      }
    }
  },
}, { timestamps: true });

mentorSchema.index({ 'location.coordinates': '2dsphere' });

const studentSchema = new Schema({
  student_id: { type: String, required: true, unique: true, index: true },
  user_id: { type: String, required: true, unique: true, index: true },
  domains_of_interest: { type: [String], required: true },
  career_goals: [String],
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }
    }
  },
  preferred_mentor_types: { type: [String], enum: ['academia', 'civil_service', 'industry', 'entrepreneur'] },
  learning_style: { type: String, enum: ['hands_on', 'theoretical', 'mixed'] },
  academic_level: { type: String, enum: ['high_school', 'undergrad', 'postgrad', 'professional'] },
  preferred_time_slots: [String],
  bio: { type: String, required: true, maxlength: 500 },
  languages: [String],
  profile_embedding: {
    type: [Number],
    index: {
      type: 'vectorSearch',
      options: {
        dimensions: 768,
        similarity: 'cosine'
      }
    }
  },
}, { timestamps: true });

const Mentor = mongoose.model('Mentor', mentorSchema);
const Student = mongoose.model('Student', studentSchema);

module.exports = { Mentor, Student };
