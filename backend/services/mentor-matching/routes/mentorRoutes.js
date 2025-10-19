const express = require('express');
const router = express.Router();
const { protect } = require('../../../middleware/authMiddleware');
const Mentor = require('../../../models/Mentor');
const User = require('../../../models/User');
const MatchingRequest = require('../../../models/MatchingRequest');
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyDxLDuLA9paxomWOgz0dXwW0Il9-BnUopo');

// Configure multer for file uploads
// ... (keeping existing multer config)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/mentors/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });


// --- AI Mentor Matching Route ---
router.post('/match', protect, async (req, res) => {
  try {
    const user = req.user;
    const { goals } = req.body; // User can specify goals for more accurate matching

    // 1. Fetch all active mentors
    const mentors = await Mentor.find({ active: true }).populate('user', 'name');

    // 2. Construct a detailed prompt for the Gemini API
    const prompt = `
      You are an expert career counselor and mentor matching algorithm. Your task is to find the best mentor matches for a student based on their profile and a list of available mentors.

      **Student Profile:**
      - Name: ${user.name}
      - Location: ${user.location || 'Not specified'}
      - Stated Interests: ${user.interests.join(', ') || 'Not specified'}
      - Stated Skills: ${user.skills.join(', ') || 'Not specified'}
      - Current Goals: ${goals || 'General career guidance'}

      **Available Mentors:**
      ${JSON.stringify(mentors.map(m => ({
        id: m._id,
        name: m.user.name,
        headline: m.headline,
        bio: m.bio,
        domains: m.expertise.domains,
        skills: m.expertise.skills,
        location: m.location.country
      })), null, 2)}

      **Your Task:**
      Based on the student's profile and the list of mentors, identify the top 3 best matches. For each match, provide a "matchScore" from 0 to 100 and a "reason" explaining why they are a good match.

      **Output MUST be in the following JSON format ONLY:**
      {
        "matches": [
          {
            "mentorId": "MENTOR_ID_1",
            "matchScore": 95,
            "reason": "This mentor is a strong match because their expertise in [Domain] directly aligns with the student's goals..."
          },
          {
            "mentorId": "MENTOR_ID_2",
            "matchScore": 88,
            "reason": "This mentor's skills in [Skill] and location make them a great fit..."
          },
          {
            "mentorId": "MENTOR_ID_3",
            "matchScore": 82,
            "reason": "While not a direct domain match, this mentor's experience in [Industry] could provide valuable perspective..."
          }
        ]
      }
    `;

    // 3. Call the Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Parse the response and fetch mentor profiles
    const recommendations = JSON.parse(text);
    const mentorIds = recommendations.matches.map(m => m.mentorId);
    const matchedMentors = await Mentor.find({ '_id': { $in: mentorIds } }).populate('user', 'name email');

    // Add the AI's reason and score to the mentor objects
    const finalResults = recommendations.matches.map(rec => {
        const mentorProfile = matchedMentors.find(m => m._id.toString() === rec.mentorId);
        return {
            ...rec,
            mentor: mentorProfile
        }
    });

    res.json({ success: true, matches: finalResults });

  } catch (error) {
    console.error('Mentor matching error:', error);
    res.status(500).json({ error: 'Failed to generate mentor matches', message: error.message });
  }
});


// --- Existing CRUD Routes ---

// Get all mentors with filters
router.get('/', async (req, res) => {
  try {
    const {
      domain,
      location,
      verified,
      free,
      minRating,
      experience,
      page = 1,
      limit = 10,
      sortBy = 'rating'
    } = req.query;

    let query = { active: true };
    if (domain) query['expertise.domains'] = domain;
    if (location) query['$or'] = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.state': new RegExp(location, 'i') },
        { 'location.country': new RegExp(location, 'i') },
        { 'location.willingToMentorRemotely': true }
    ];
    if (verified === 'true') query['verification.isVerified'] = true;
    if (free === 'true') query['pricing.isFree'] = true;
    if (minRating) query['stats.averageRating'] = { $gte: parseFloat(minRating) };
    if (experience) query['expertise.yearsOfExperience'] = { $gte: parseInt(experience) };

    let sortOptions = {};
    switch (sortBy) {
      case 'rating': sortOptions = { 'stats.averageRating': -1 }; break;
      case 'experience': sortOptions = { 'expertise.yearsOfExperience': -1 }; break;
      case 'reviews': sortOptions = { 'stats.totalReviews': -1 }; break;
      case 'newest': sortOptions = { joinedDate: -1 }; break;
      default: sortOptions = { 'stats.averageRating': -1 };
    }

    const skip = (page - 1) * limit;
    const mentors = await Mentor.find(query).populate('user', 'name email').sort(sortOptions).skip(skip).limit(parseInt(limit)).select('-__v');
    const total = await Mentor.countDocuments(query);

    res.json({
      success: true,
      mentors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMentors: total,
        hasMore: skip + mentors.length < total
      }
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ error: 'Failed to fetch mentors', message: error.message });
  }
});

// Get single mentor by ID
router.get('/:id', async (req, res) => {
  try {
    const mentor = await Mentor.findOne({user: req.params.id}).populate('user', 'name email');
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    const reviews = await MatchingRequest.find({ mentor: mentor._id, status: 'completed', rating: { $exists: true }})
      .populate('student', 'name')
      .sort('-createdAt')
      .limit(5);

    res.json({ success: true, mentor, recentReviews: reviews });
  } catch (error) {
    console.error('Get mentor error:', error);
    res.status(500).json({ error: 'Failed to fetch mentor', message: error.message });
  }
});

// Create new mentor profile
router.post('/register', protect, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'verificationDocuments', maxCount: 3 }
]), async (req, res) => {
  try {
    const mentorData = req.body;
    mentorData.user = req.user.id;

    if (req.files) {
      if (req.files.profilePicture) {
        mentorData.profile = mentorData.profile || {};
        mentorData.profile.profilePicture = req.files.profilePicture[0].path;
      }
      if (req.files.verificationDocuments) {
        mentorData.verification = mentorData.verification || {};
        mentorData.verification.verificationDocuments = req.files.verificationDocuments.map(f => f.path);
      }
    }

    const existingMentor = await Mentor.findOne({ user: req.user.id });
    if (existingMentor) return res.status(400).json({ error: 'User already has a mentor profile' });

    const mentor = new Mentor(mentorData);
    await mentor.save();
    await User.findByIdAndUpdate(req.user.id, { role: 'mentor', mentorProfile: mentor._id });

    res.status(201).json({ success: true, message: 'Mentor profile created successfully', mentorId: mentor._id });
  } catch (error) {
    console.error('Mentor registration error:', error);
    res.status(500).json({ error: 'Failed to register mentor', message: error.message });
  }
});

// Update mentor profile
router.put('/', protect, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
]), async (req, res) => {
  try {
    const updateData = req.body;
    const mentor = await Mentor.findOne({ user: req.user.id });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    if (req.files && req.files.profilePicture) {
        updateData.profile = updateData.profile || {};
        updateData.profile.profilePicture = req.files.profilePicture[0].path;
    }
    updateData.lastActive = new Date();

    const updatedMentor = await Mentor.findByIdAndUpdate(mentor._id, { $set: updateData }, { new: true, runValidators: true });
    res.json({ success: true, message: 'Mentor profile updated successfully', mentor: updatedMentor });
  } catch (error) {
    console.error('Mentor update error:', error);
    res.status(500).json({ error: 'Failed to update mentor', message: error.message });
  }
});

// Deactivate mentor profile
router.delete('/', protect, async (req, res) => {
  try {
    const mentor = await Mentor.findOneAndUpdate({ user: req.user.id }, { active: false }, { new: true });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });
    res.json({ success: true, message: 'Mentor profile deactivated successfully' });
  } catch (error) {
    console.error('Deactivation error:', error);
    res.status(500).json({ error: 'Failed to deactivate mentor', message: error.message });
  }
});

module.exports = router;
