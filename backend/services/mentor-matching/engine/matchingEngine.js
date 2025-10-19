const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Mentor, Student, MatchingRequest } = require('../models');
const geolib = require('geolib');

// Free LLM Configuration - Using multiple free APIs
const LLM_APIS = {
  huggingface: {
    url: 'https://api-inference.huggingface.co/models/',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    headers: (apiKey) => ({
      'Content-Type': 'application/json'
    })
  },
  together: {
    url: 'https://api.together.xyz/inference',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  }
};

// Matching Algorithm Class
class MentorMatchingEngine {
  constructor() {
    this.weights = {
      domainMatch: 0.35,      // 35% weight for domain expertise match
      locationMatch: 0.15,    // 15% weight for location proximity
      availabilityMatch: 0.15, // 15% weight for schedule compatibility
      experienceMatch: 0.20,  // 20% weight for experience level match
      goalAlignment: 0.15     // 15% weight for goal alignment
    };
  }

  // Calculate domain match score
  calculateDomainMatch(studentDomains, mentorDomains, studentSkills, mentorSkills) {
    if (!studentDomains || !mentorDomains) return 0;
    
    // Domain overlap calculation
    const domainIntersection = studentDomains.filter(d => 
      mentorDomains.includes(d)
    );
    const domainScore = domainIntersection.length / Math.max(studentDomains.length, 1);
    
    // Skills overlap calculation
    let skillScore = 0;
    if (studentSkills && mentorSkills) {
      const skillIntersection = studentSkills.filter(s => 
        mentorSkills.some(ms => 
          ms.toLowerCase().includes(s.toLowerCase()) || 
          s.toLowerCase().includes(ms.toLowerCase())
        )
      );
      skillScore = skillIntersection.length / Math.max(studentSkills.length, 1);
    }
    
    // Combined score (70% domain, 30% skills)
    return (domainScore * 0.7 + skillScore * 0.3) * 100;
  }

  // Calculate location match score
  calculateLocationMatch(studentLocation, mentorLocation) {
    // Perfect match if mentor is willing to mentor remotely
    if (mentorLocation.willingToMentorRemotely) {
      return 100;
    }
    
    // Check country match
    if (studentLocation.country !== mentorLocation.country) {
      return 10; // Low score for different countries
    }
    
    // Check state/city match
    if (studentLocation.state === mentorLocation.state) {
      if (studentLocation.city === mentorLocation.city) {
        return 100; // Same city
      }
      return 60; // Same state, different city
    }
    
    // If coordinates are available, calculate distance
    if (studentLocation.coordinates && mentorLocation.coordinates) {
      const distance = geolib.getDistance(
        {
          latitude: studentLocation.coordinates.latitude,
          longitude: studentLocation.coordinates.longitude
        },
        {
          latitude: mentorLocation.coordinates.latitude,
          longitude: mentorLocation.coordinates.longitude
        }
      );
      
      // Convert distance to score (closer = higher score)
      if (distance < 50000) return 80;  // Within 50km
      if (distance < 200000) return 50; // Within 200km
      if (distance < 500000) return 30; // Within 500km
      return 10;
    }
    
    return 30; // Default score for same country
  }

  // Calculate availability match score
  calculateAvailabilityMatch(studentPrefs, mentorAvailability) {
    let score = 0;
    let factors = 0;
    
    // Check communication mode compatibility
    if (studentPrefs.communicationMode && mentorAvailability.preferences?.communicationModes) {
      const modeMatch = studentPrefs.communicationMode.some(mode =>
        mentorAvailability.preferences.communicationModes.includes(mode)
      );
      score += modeMatch ? 100 : 50;
      factors++;
    }
    
    // Check language compatibility
    if (studentPrefs.languages && mentorAvailability.preferences?.languages) {
      const langMatch = studentPrefs.languages.some(lang =>
        mentorAvailability.preferences.languages.includes(lang)
      );
      score += langMatch ? 100 : 0;
      factors++;
    }
    
    // Check session frequency compatibility
    if (studentPrefs.sessionFrequency) {
      const hoursPerWeek = mentorAvailability.availability?.hoursPerWeek || 2;
      let freqScore = 0;
      
      switch(studentPrefs.sessionFrequency) {
        case 'weekly':
          freqScore = hoursPerWeek >= 2 ? 100 : 50;
          break;
        case 'bi-weekly':
          freqScore = hoursPerWeek >= 1 ? 100 : 70;
          break;
        case 'monthly':
          freqScore = 100; // Most mentors can accommodate monthly
          break;
        case 'as-needed':
          freqScore = 90;
          break;
        default:
          freqScore = 50;
      }
      score += freqScore;
      factors++;
    }
    
    return factors > 0 ? score / factors : 50;
  }

  // Calculate experience match score
  calculateExperienceMatch(studentLevel, studentGoals, mentorExperience, mentorBackground) {
    let score = 0;
    
    // Years of experience scoring
    const yearsExp = mentorExperience.yearsOfExperience || 0;
    if (yearsExp >= 10) score = 100;
    else if (yearsExp >= 5) score = 80;
    else if (yearsExp >= 3) score = 60;
    else score = 40;
    
    // Adjust based on student level preferences
    if (mentorExperience.preferences?.menteeLevel) {
      const levelMatch = mentorExperience.preferences.menteeLevel.includes(
        studentLevel || 'student'
      );
      score = levelMatch ? score : score * 0.7;
    }
    
    // Bonus for relevant achievements
    if (mentorBackground?.achievements && mentorBackground.achievements.length > 0) {
      score = Math.min(100, score + 10);
    }
    
    return score;
  }

  // Calculate goal alignment using AI
  async calculateGoalAlignment(studentGoals, mentorSpecializations, apiKey) {
    try {
      // Prepare text for analysis
      const studentText = `
        Short-term goals: ${studentGoals.shortTerm?.join(', ') || 'Not specified'}
        Medium-term goals: ${studentGoals.mediumTerm?.join(', ') || 'Not specified'}
        Long-term goals: ${studentGoals.longTerm?.join(', ') || 'Not specified'}
        Learning objectives: ${studentGoals.learningObjectives?.join(', ') || 'Not specified'}
      `;
      
      const mentorText = `
        Specializations: ${mentorSpecializations?.join(', ') || 'General mentoring'}
        Approach: ${mentorSpecializations?.approach || 'Flexible'}
      `;
      
      // Try to use Hugging Face API for text similarity
      if (process.env.HUGGINGFACE_API_KEY) {
        const response = await axios.post(
          'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
          {
            inputs: {
              source_sentence: studentText,
              sentences: [mentorText]
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        ).catch(err => null);
        
        if (response?.data) {
          // Convert similarity score to percentage
          const similarity = response.data[0] || 0.5;
          return similarity * 100;
        }
      }
      
      // Fallback: Simple keyword matching
      const studentKeywords = studentText.toLowerCase().split(/\s+/);
      const mentorKeywords = mentorText.toLowerCase().split(/\s+/);
      
      const matches = studentKeywords.filter(keyword => 
        mentorKeywords.some(mk => mk.includes(keyword) || keyword.includes(mk))
      );
      
      return Math.min(100, (matches.length / studentKeywords.length) * 100);
      
    } catch (error) {
      console.error('Goal alignment calculation error:', error);
      return 50; // Default middle score on error
    }
  }

  // Main matching function
  async calculateMatchScore(student, mentor) {
    // Calculate individual scores
    const domainScore = this.calculateDomainMatch(
      student.career?.targetDomains,
      mentor.expertise?.domains,
      student.career?.skills,
      mentor.expertise?.skills
    );
    
    const locationScore = this.calculateLocationMatch(
      student.location,
      mentor.location
    );
    
    const availabilityScore = this.calculateAvailabilityMatch(
      student.preferences,
      mentor.mentorship
    );
    
    const experienceScore = this.calculateExperienceMatch(
      student.education?.currentLevel,
      student.goals,
      mentor.expertise,
      mentor.background
    );
    
    const goalScore = await this.calculateGoalAlignment(
      student.goals,
      mentor.mentorship?.style?.specializations
    );
    
    // Calculate weighted total score
    const totalScore = 
      (domainScore * this.weights.domainMatch) +
      (locationScore * this.weights.locationMatch) +
      (availabilityScore * this.weights.availabilityMatch) +
      (experienceScore * this.weights.experienceMatch) +
      (goalScore * this.weights.goalAlignment);
    
    return {
      totalScore: Math.round(totalScore),
      breakdown: {
        domainMatch: Math.round(domainScore),
        locationMatch: Math.round(locationScore),
        availabilityMatch: Math.round(availabilityScore),
        experienceMatch: Math.round(experienceScore),
        goalAlignment: Math.round(goalScore)
      }
    };
  }

  // Get match recommendations with explanations
  async getMatchExplanation(student, mentor, scores) {
    const explanations = [];
    
    if (scores.domainMatch >= 70) {
      explanations.push(`Strong domain alignment in ${mentor.expertise?.domains?.join(', ')}`);
    }
    
    if (scores.locationMatch >= 80) {
      explanations.push('Located in the same area or offers remote mentoring');
    }
    
    if (scores.availabilityMatch >= 70) {
      explanations.push('Compatible availability and communication preferences');
    }
    
    if (scores.experienceMatch >= 80) {
      explanations.push(`${mentor.expertise?.yearsOfExperience}+ years of relevant experience`);
    }
    
    if (scores.goalAlignment >= 70) {
      explanations.push('Strong alignment with your career goals');
    }
    
    // Add mentor highlights
    if (mentor.stats?.averageRating >= 4.5) {
      explanations.push(`Highly rated mentor (${mentor.stats.averageRating}/5)`);
    }
    
    if (mentor.verification?.isVerified) {
      explanations.push('Verified mentor credentials');
    }
    
    return explanations;
  }
}

// Initialize matching engine
const matchingEngine = new MentorMatchingEngine();

// API Routes

// Find best mentor matches for a student
router.post('/find-mentors', async (req, res) => {
  try {
    const { studentId, filters = {}, limit = 10 } = req.body;
    
    // Get student profile
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Build mentor query based on filters
    let mentorQuery = { active: true };
    
    if (filters.domains && filters.domains.length > 0) {
      mentorQuery['expertise.domains'] = { $in: filters.domains };
    }
    
    if (filters.location) {
      if (filters.location.country) {
        mentorQuery['$or'] = [
          { 'location.country': filters.location.country },
          { 'location.willingToMentorRemotely': true }
        ];
      }
    }
    
    if (filters.verified) {
      mentorQuery['verification.isVerified'] = true;
    }
    
    if (filters.free) {
      mentorQuery['pricing.isFree'] = true;
    }
    
    // Get potential mentors
    const mentors = await Mentor.find(mentorQuery).limit(50);
    
    // Calculate match scores for each mentor
    const matchResults = await Promise.all(
      mentors.map(async (mentor) => {
        const matchData = await matchingEngine.calculateMatchScore(student, mentor);
        const explanations = await matchingEngine.getMatchExplanation(
          student, 
          mentor, 
          matchData.breakdown
        );
        
        return {
          mentor: {
            id: mentor._id,
            name: mentor.profile.name,
            bio: mentor.profile.bio,
            profilePicture: mentor.profile.profilePicture,
            expertise: mentor.expertise,
            location: {
              country: mentor.location.country,
              city: mentor.location.city,
              remote: mentor.location.willingToMentorRemotely
            },
            stats: mentor.stats,
            verified: mentor.verification.isVerified,
            pricing: mentor.pricing
          },
          matchScore: matchData.totalScore,
          matchBreakdown: matchData.breakdown,
          explanations: explanations
        };
      })
    );
    
    // Sort by match score and return top matches
    const topMatches = matchResults
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
    
    res.json({
      success: true,
      matches: topMatches,
      totalFound: matchResults.length
    });
    
  } catch (error) {
    console.error('Mentor matching error:', error);
    res.status(500).json({ 
      error: 'Failed to find mentor matches',
      message: error.message 
    });
  }
});

// Request mentor connection
router.post('/request-connection', async (req, res) => {
  try {
    const { studentId, mentorId, message } = req.body;
    
    // Check if request already exists
    const existingRequest = await MatchingRequest.findOne({
      studentId,
      mentorId,
      status: { $in: ['pending', 'accepted'] }
    });
    
    if (existingRequest) {
      return res.status(400).json({ 
        error: 'Connection request already exists' 
      });
    }
    
    // Get student and mentor details
    const student = await Student.findById(studentId);
    const mentor = await Mentor.findById(mentorId);
    
    if (!student || !mentor) {
      return res.status(404).json({ 
        error: 'Student or mentor not found' 
      });
    }
    
    // Calculate match score
    const matchData = await matchingEngine.calculateMatchScore(student, mentor);
    
    // Create matching request
    const matchingRequest = new MatchingRequest({
      studentId,
      mentorId,
      message,
      matchScore: matchData.totalScore,
      matchFactors: matchData.breakdown,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    await matchingRequest.save();
    
    res.json({
      success: true,
      requestId: matchingRequest._id,
      message: 'Connection request sent successfully'
    });
    
  } catch (error) {
    console.error('Connection request error:', error);
    res.status(500).json({ 
      error: 'Failed to send connection request',
      message: error.message 
    });
  }
});

// Get match suggestions based on AI analysis
router.post('/ai-suggestions', async (req, res) => {
  try {
    const { studentId } = req.body;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Generate AI-based suggestions using free LLM
    let suggestions = {
      recommendedDomains: [],
      skillsToLearn: [],
      mentorTypes: [],
      tips: []
    };
    
    // Analyze student profile and generate suggestions
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `
          Based on this student profile, provide mentorship recommendations:
          Career Interests: ${student.career?.interests?.join(', ')}
          Target Domains: ${student.career?.targetDomains?.join(', ')}
          Current Skills: ${student.career?.skills?.join(', ')}
          Short-term Goals: ${student.goals?.shortTerm?.join(', ')}
          
          Provide:
          1. Top 3 recommended mentor expertise areas
          2. Top 5 skills they should focus on learning
          3. Best type of mentor for them (industry/academic/entrepreneur)
          4. 3 tips for successful mentorship
          
          Format as JSON with keys: recommendedDomains, skillsToLearn, mentorTypes, tips
        `;
        
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          }
        );
        
        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const aiResponse = response.data.candidates[0].content.parts[0].text;
          try {
            // Try to parse JSON from response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              suggestions = JSON.parse(jsonMatch[0]);
            }
          } catch (parseError) {
            // Fallback to text parsing
            console.log('JSON parse failed, using defaults');
          }
        }
      } catch (aiError) {
        console.error('AI suggestion error:', aiError);
      }
    }
    
    // Provide default suggestions if AI fails
    if (!suggestions.recommendedDomains.length) {
      suggestions = {
        recommendedDomains: student.career?.targetDomains || ['technology', 'business'],
        skillsToLearn: [
          'Communication skills',
          'Problem-solving',
          'Leadership',
          'Time management',
          'Technical skills in your domain'
        ],
        mentorTypes: ['industry', 'entrepreneur'],
        tips: [
          'Be clear about your goals and expectations',
          'Come prepared with questions to each session',
          'Follow up on action items between sessions'
        ]
      };
    }
    
    res.json({
      success: true,
      suggestions
    });
    
  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI suggestions',
      message: error.message 
    });
  }
});

module.exports = router;
