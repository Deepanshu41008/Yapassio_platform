const { Exam, StudyResource, StudyPlan, Question, StudentAttempt, WeakAreaReport, MockTest, MockTestSubmission } = require('../models/examPreparationModels');
const { callGeminiAPI } = require('../utils/gemini');
const { v4: uuidv4 } = require('uuid');

// FR7.1: Exam Configuration Management
exports.listExams = async (req, res) => {
    try {
        const exams = await Exam.find({}, 'exam_id exam_name exam_type');
        const examList = exams.map(exam => ({
            exam_id: exam.exam_id,
            exam_name: exam.exam_name,
            exam_type: exam.exam_type,
            total_topics: exam.syllabus_topics ? exam.syllabus_topics.length : 0,
            official_website: "http://example.com" // Placeholder
        }));

        res.status(200).json({
            success: true,
            data: {
                exams: examList,
                total_count: exams.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

exports.getSyllabus = async (req, res) => {
    try {
        const { exam_id } = req.params;
        const exam = await Exam.findOne({ exam_id });

        if (!exam) {
            return res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Exam not found.' } });
        }

        res.status(200).json({
            success: true,
            data: {
                exam_id: exam.exam_id,
                syllabus_topics: exam.syllabus_topics,
                exam_pattern: exam.exam_pattern,
                last_updated: exam.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

// FR7.2: Resource Curation Engine
exports.curateResources = async (req, res) => {
    try {
        const { exam_id, topic, student_level, resource_types, limit = 10 } = req.body;

        // In a real application, you would have a database of resources.
        // Here we'll generate some dummy data and use Gemini to rank them.
        const dummyResources = [
            { resource_id: uuidv4(), title: `Introduction to ${topic}`, type: "video", url: `http://youtube.com/watch?v=123`, provider: "YouTube" },
            { resource_id: uuidv4(), title: `${topic} Explained`, type: "pdf", url: `http://example.com/doc.pdf`, provider: "Example University" },
            { resource_id: uuidv4(), title: `Practice problems for ${topic}`, type: "practice", url: `http://example.com/quiz`, provider: "QuizPlatform" }
        ];

        let curatedResources = [];
        for (const resource of dummyResources) {
            const prompt = `Analyze this study resource: Title: ${resource.title}, Type: ${resource.type}, Topic: ${topic}. Rate its quality (1-10) for a ${student_level} student. Return JSON: {"quality_score": number, "reasoning": "...", "target_difficulty": "..."}`;
            const geminiResponse = await callGeminiAPI(prompt);
            const { quality_score, reasoning, target_difficulty } = JSON.parse(geminiResponse.replace(/```json\n|\n```/g, ''));

            curatedResources.push({
                ...resource,
                quality_score,
                difficulty: target_difficulty,
                duration_minutes: Math.floor(Math.random() * 60) + 10,
                ai_recommendation: reasoning
            });
        }

        curatedResources.sort((a, b) => b.quality_score - a.quality_score);
        curatedResources = curatedResources.slice(0, limit);

        res.status(200).json({
            success: true,
            data: {
                resources: curatedResources,
                topic: topic,
                curation_timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

// FR7.3: Adaptive Study Planner
exports.generateStudyPlan = async (req, res) => {
    try {
        const { student_id, exam_id, target_exam_date, daily_study_hours, completed_topics = [], weak_areas = [], preferences = {} } = req.body;
        const exam = await Exam.findOne({ exam_id });
        if (!exam) return res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Exam not found.' } });

        const remaining_topics = exam.syllabus_topics.filter(t => !completed_topics.includes(t.topic_id)).map(t => t.topic_name);
        const days_remaining = Math.ceil((new Date(target_exam_date) - new Date()) / (1000 * 60 * 60 * 24));

        const prompt = `Create a ${days_remaining}-day study plan for ${exam.exam_name}. Student studies ${daily_study_hours} hours/day. Remaining topics: ${remaining_topics.join(', ')}. Weak areas needing extra time: ${weak_areas.join(', ')}. Preferences: ${JSON.stringify(preferences)}. Generate a day-by-day schedule. Return as structured JSON: {"schedule": [{"date": "YYYY-MM-DD", "topics": [{"topic_name": "...", "duration_minutes": "..."}], "is_revision_day": "...", "is_mock_test_day": "..."}], "milestones": [{"week": "...", "target": "..."}], "ai_confidence_score": "..."}`;
        const geminiResponse = await callGeminiAPI(prompt);
        const planData = JSON.parse(geminiResponse.replace(/```json\n|\n```/g, ''));

        const newPlan = new StudyPlan({
            study_plan_id: uuidv4(),
            student_id,
            exam_id,
            target_exam_date,
            ...planData
        });
        await newPlan.save();

        res.status(201).json({ success: true, data: newPlan });

    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

// FR7.4: Practice Question Generator
exports.generateQuestions = async (req, res) => {
    try {
        const { exam_id, topic, difficulty, question_type, count } = req.body;
        const prompt = `Generate ${count} ${difficulty} ${question_type} questions for exam topic: ${topic}. For each question provide: question text, options (if MCQ), correct answer, and a detailed explanation. Format as a JSON array of objects.`;
        const geminiResponse = await callGeminiAPI(prompt);
        const questions = JSON.parse(geminiResponse.replace(/```json\n|\n```/g, ''));

        // Save questions to the database
        const questionDocs = questions.map(q => new Question({
            question_id: uuidv4(),
            exam_id,
            topic,
            difficulty,
            ...q,
            source: 'ai_generated'
        }));
        await Question.insertMany(questionDocs);

        res.status(200).json({ success: true, data: { question_set_id: uuidv4(), questions: questionDocs } });

    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

// FR7.5: Weak Area Detection & Remedy
exports.analyzeWeakAreas = async (req, res) => {
    try {
        const { student_id } = req.params;
        const { exam_id, attempt_history } = req.body;

        // Basic analysis (can be expanded)
        let topicPerformance = {};
        attempt_history.forEach(attempt => {
            if (!topicPerformance[attempt.topic]) {
                topicPerformance[attempt.topic] = { correct: 0, total: 0, time: 0 };
            }
            topicPerformance[attempt.topic].total++;
            if (attempt.is_correct) topicPerformance[attempt.topic].correct++;
            topicPerformance[attempt.topic].time += attempt.time_taken_seconds;
        });

        const weak_topics = Object.entries(topicPerformance).map(([topic, data]) => ({
            topic,
            accuracy_rate: (data.correct / data.total) * 100,
            time_efficiency: data.time / data.total
        })).filter(t => t.accuracy_rate < 60);

        const prompt = `Student performance summary for exam ${exam_id}: ${JSON.stringify(weak_topics)}. Identify root causes and suggest a remedial plan. Return as JSON: {"root_causes": "...", "remedial_plan": "..."}`;
        const geminiResponse = await callGeminiAPI(prompt);
        const analysis = JSON.parse(geminiResponse.replace(/```json\n|\n```/g, ''));

        const report = new WeakAreaReport({
            report_id: uuidv4(),
            student_id,
            exam_id,
            weak_topics,
            remedial_plan: analysis.remedial_plan,
            // ai_root_cause_analysis needs to be added to the prompt and response handling
        });
        await report.save();

        res.status(200).json({ success: true, data: report });

    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

// FR7.6: Mock Test Engine
exports.generateMockTest = async (req, res) => {
    try {
        const { exam_id, test_type, difficulty_distribution } = req.body;
        const exam = await Exam.findOne({ exam_id });
        if (!exam) return res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Exam not found.' } });

        // This is a simplified implementation. A real one would be more complex.
        const easyCount = Math.floor((difficulty_distribution.easy / 100) * (exam.exam_pattern.total_questions || 50));
        const mediumCount = Math.floor((difficulty_distribution.medium / 100) * (exam.exam_pattern.total_questions || 50));
        const hardCount = Math.ceil((difficulty_distribution.hard / 100) * (exam.exam_pattern.total_questions || 50));

        const easyQuestions = await Question.find({ exam_id, difficulty: 'easy' }).limit(easyCount);
        const mediumQuestions = await Question.find({ exam_id, difficulty: 'medium' }).limit(mediumCount);
        const hardQuestions = await Question.find({ exam_id, difficulty: 'hard' }).limit(hardCount);

        const questions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];

        const newTest = new MockTest({
            mock_test_id: uuidv4(),
            exam_id,
            test_type,
            test_config: exam.exam_pattern,
            questions: questions.map(q => q._id)
        });
        await newTest.save();

        res.status(201).json({ success: true, data: { mock_test_id: newTest.mock_test_id, test_config: newTest.test_config, questions } });

    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

exports.submitMockTest = async (req, res) => {
    try {
        const { test_id } = req.params;
        const { student_id, answers } = req.body;

        const mockTest = await MockTest.findOne({mock_test_id: test_id}).populate('questions');
        if (!mockTest) return res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Mock test not found.' } });

        let score = 0;
        let question_wise_analysis = [];

        for (const answer of answers) {
            const question = mockTest.questions.find(q => q.question_id === answer.question_id);
            if (question) {
                const is_correct = question.correct_answer === answer.student_answer;
                if (is_correct) score++;
                question_wise_analysis.push({ question_id: answer.question_id, is_correct });
            }
        }

        const prompt = `A student scored ${score} out of ${mockTest.questions.length} on a mock test for ${mockTest.exam_id}. Provide a brief performance report with strengths and weaknesses.`;
        const geminiResponse = await callGeminiAPI(prompt);
        const ai_performance_report = geminiResponse;

        const submission = new MockTestSubmission({
            submission_id: uuidv4(),
            student_id,
            mock_test_id: test_id,
            answers,
            score_summary: { total_score: score, max_score: mockTest.questions.length, percentage: (score / mockTest.questions.length) * 100 },
            question_wise_analysis,
            ai_performance_report
        });
        await submission.save();

        res.status(200).json({ success: true, data: submission });

    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};
