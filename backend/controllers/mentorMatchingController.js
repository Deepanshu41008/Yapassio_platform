const { Mentor, Student } = require('../models/mentorMatchingModels');
const { callGeminiAPI, getEmbedding } = require('../utils/gemini');
const { v4: uuidv4 } = require('uuid');
const { cosineSimilarity, getDistanceFromLatLonInKm } = require('../utils/helpers');

// FR6.1: Mentor Profile Management
exports.registerMentor = async (req, res) => {
    try {
        const { user_id, mentor_type, domains, location, availability_hours_per_week, preferred_time_slots, expertise_level, years_of_experience, bio, languages, max_mentees } = req.body;

        const existingMentor = await Mentor.findOne({ user_id });
        if (existingMentor) {
            return res.status(409).json({ success: false, error: { code: 'ALREADY_EXISTS', message: 'User already registered as a mentor.' } });
        }

        const embeddingText = `Mentor bio: ${bio}. Domains: ${domains.join(', ')}. Expertise: ${expertise_level}.`;
        const profile_embedding = await getEmbedding(embeddingText);

        const newMentor = new Mentor({
            mentor_id: uuidv4(),
            user_id,
            mentor_type,
            domains,
            location,
            availability_hours_per_week,
            preferred_time_slots,
            expertise_level,
            years_of_experience,
            bio,
            languages,
            max_mentees,
            profile_embedding,
        });

        await newMentor.save();

        res.status(201).json({
            success: true,
            data: {
                mentor_id: newMentor.mentor_id,
                verification_status: newMentor.verification_status,
                profile_embedding_generated: true,
                created_at: newMentor.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

// FR6.2: Student Profile Management
exports.createStudentProfile = async (req, res) => {
     try {
        const { user_id, domains_of_interest, career_goals, location, preferred_mentor_types, learning_style, academic_level, bio, languages, preferred_time_slots } = req.body;

        const embeddingText = `Student bio: ${bio}. Interests: ${domains_of_interest.join(', ')}. Career Goals: ${career_goals.join(', ')}.`;
        const profile_embedding = await getEmbedding(embeddingText);

        const studentProfile = await Student.findOneAndUpdate(
            { user_id },
            {
                student_id: uuidv4(),
                user_id,
                domains_of_interest,
                career_goals,
                location,
                preferred_mentor_types,
                learning_style,
                academic_level,
                bio,
                languages,
                preferred_time_slots,
                profile_embedding,
            },
            { new: true, upsert: true }
        );

        res.status(201).json({
            success: true,
            data: {
                student_id: studentProfile.student_id,
                profile_embedding_generated: true,
                created_at: studentProfile.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

exports.findMentors = async (req, res) => {
    try {
        const { student_id, filters = {}, preferences = {}, limit = 10 } = req.body;

        const student = await Student.findOne({ user_id: student_id });
        if (!student) {
            return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Student not found.' } });
        }

        // Step 1: Candidate Filtering
        let query = {
            verification_status: 'verified',
            'location.coordinates': {
                $near: {
                    $geometry: student.location.coordinates,
                    $maxDistance: (filters.max_distance_km || 100) * 1000,
                },
            },
        };

        if (filters.mentor_types) query.mentor_type = { $in: filters.mentor_types };
        if (filters.min_experience_years) query.years_of_experience = { $gte: filters.min_experience_years };
        if (filters.required_languages) query.languages = { $all: filters.required_languages };

        const mentors = await Mentor.find(query).limit(100);

        let matches = [];
        for (const mentor of mentors) {
            // Step 2 & 3: Multi-Factor Scoring
            const domainSimilarity = cosineSimilarity(student.profile_embedding, mentor.profile_embedding);

            const distance = getDistanceFromLatLonInKm(
                student.location.coordinates.coordinates[1], student.location.coordinates.coordinates[0],
                mentor.location.coordinates.coordinates[1], mentor.location.coordinates.coordinates[0]
            );
            const locationScore = Math.max(0, 1 - (distance / (filters.max_distance_km || 100)));

            const availabilityScore = mentor.preferred_time_slots.filter(slot => student.preferred_time_slots.includes(slot)).length / student.preferred_time_slots.length;

            const experiencePrompt = `Does a mentor with ${mentor.years_of_experience} years of experience and expertise level ${mentor.expertise_level} match a student who is at the ${student.academic_level} academic level? Respond with a score from 0 to 1.`;
            const experienceResponse = await callGeminiAPI(experiencePrompt);
            const experienceMatchScore = parseFloat(experienceResponse);

            const languageMatch = (mentor.languages.filter(l => student.languages.includes(l)).length / student.languages.length);

            const compatibilityScore =
                (domainSimilarity * 0.40) +
                (locationScore * 0.20) +
                (availabilityScore * 0.15) +
                (experienceMatchScore * 0.15) +
                (languageMatch * 0.10);

            matches.push({
                user_id: mentor.user_id,
                mentor_id: mentor.mentor_id,
                compatibility_score: compatibilityScore * 100,
                score_breakdown: { domain_similarity: domainSimilarity, location_score: locationScore, availability_score: availabilityScore, experience_match: experienceMatchScore, language_match: languageMatch },
                mentor_profile: mentor,
                distance_km: distance
            });
        }

        matches.sort((a, b) => b.compatibility_score - a.compatibility_score);
        matches = matches.slice(0, limit);

        for (let match of matches) {
            const prompt = `Given student profile: {bio: "${student.bio}", domains: "${student.domains_of_interest.join(', ')}", goals: "${student.career_goals.join(', ')}"} And mentor profile: {bio: "${match.mentor_profile.bio}", domains: "${match.mentor_profile.domains.join(', ')}", experience: "${match.mentor_profile.years_of_experience} years"}. Explain in 2-3 sentences why this is a good match.`;
            match.ai_reasoning = await callGeminiAPI(prompt);
        }

        res.status(200).json({
            success: true,
            data: {
                matches,
                total_evaluated: mentors.length,
                algorithm_version: "1.0",
                matched_at: new Date().toISOString()
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};
