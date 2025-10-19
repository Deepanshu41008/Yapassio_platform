const { CareerScenario, Simulation, SimulationEvaluation, RolePlayConversation } = require('../models/careerSimulationModels');
const { callGeminiAPI } = require('../utils/gemini');
const { v4: uuidv4 } = require('uuid');

// FR8.1: Career Path Configuration
exports.listCareers = async (req, res) => {
    try {
        // In a real app, this would come from the CareerScenario collection.
        // For now, using dummy data.
        const careers = [
            { career_id: 'software-dev', career_name: 'Software Development', industry: 'Technology', available_scenarios: 10, skill_categories: ['Frontend', 'Backend'] },
            { career_id: 'data-science', career_name: 'Data Science & Analytics', industry: 'Technology', available_scenarios: 8, skill_categories: ['Machine Learning', 'Data Visualization'] }
        ];

        res.status(200).json({
            success: true,
            data: {
                careers,
                total_count: careers.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

exports.listScenarios = async (req, res) => {
    try {
        const { career_id } = req.params;
        const scenarios = await CareerScenario.find({ career_track: career_id });
        res.status(200).json({ success: true, data: { scenarios, total_count: scenarios.length } });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

// FR8.3: Gemini-Powered Scenario Generation
exports.generateScenario = async (req, res) => {
    try {
        const { career_track, job_level, skill_focus, industry_context } = req.body;
        const prompt = `Create a realistic workplace simulation for a ${job_level} ${career_track} in ${industry_context}, focusing on skills: ${skill_focus.join(', ')}. Generate a scenario title, context, your role, provided artifacts, required deliverables, and evaluation criteria. Return as structured JSON.`;
        const geminiResponse = await callGeminiAPI(prompt);
        const scenarioData = JSON.parse(geminiResponse.replace(/```json\n|\n```/g, ''));

        const newScenario = new CareerScenario({
            scenario_id: uuidv4(),
            career_track,
            job_level,
            ...scenarioData,
            source: 'ai_generated'
        });
        await newScenario.save();

        res.status(201).json({ success: true, data: newScenario });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

// FR8.2: Virtual Internship Module Engine
exports.startSimulation = async (req, res) => {
    try {
        const { student_id, scenario_id } = req.body;
        const scenario = await CareerScenario.findOne({ scenario_id });
        if (!scenario) return res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Scenario not found.' } });

        const newSimulation = new Simulation({
            simulation_id: uuidv4(),
            student_id,
            scenario_id,
            deadline: new Date(Date.now() + 60 * 60 * 1000) // 1 hour deadline
        });
        await newSimulation.save();

        res.status(201).json({ success: true, data: { simulation_id: newSimulation.simulation_id, scenario, started_at: newSimulation.started_at, deadline: newSimulation.deadline } });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

exports.submitSimulation = async (req, res) => {
    try {
        const { simulation_id } = req.params;
        const { deliverables } = req.body;
        // In a real app, you'd handle file uploads and store content.
        const updatedSimulation = await Simulation.findOneAndUpdate(
            { simulation_id },
            { status: 'submitted', submitted_at: new Date(), deliverables },
            { new: true }
        );
        res.status(200).json({ success: true, data: { submission_id: uuidv4(), submitted_at: updatedSimulation.submitted_at, evaluation_status: 'pending' } });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

// FR8.4: Multi-Dimensional Performance Evaluation
exports.evaluateSimulation = async (req, res) => {
    try {
        const { simulation_id } = req.params;
        const simulation = await Simulation.findOne({ simulation_id });
        if (!simulation) return res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Simulation not found.' } });

        // This is a simplified evaluation. A real one would be more detailed.
        const prompt = `Evaluate the following submission for a simulation: ${JSON.stringify(simulation.deliverables)}. Provide an overall score (0-100) and detailed feedback. Return as JSON: {"overall_score": "...", "detailed_feedback": "..."}`;
        const geminiResponse = await callGeminiAPI(prompt);
        const evaluationData = JSON.parse(geminiResponse.replace(/```json\n|\n```/g, ''));

        const newEvaluation = new SimulationEvaluation({
            evaluation_id: uuidv4(),
            simulation_id,
            student_id: simulation.student_id,
            ...evaluationData,
            performance_level: evaluationData.overall_score > 80 ? 'Excellent' : 'Good' // Simplified
        });
        await newEvaluation.save();

        await Simulation.updateOne({ simulation_id }, { status: 'evaluated' });

        res.status(200).json({ success: true, data: newEvaluation });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

// FR8.5: Real-World Freelance Task Matching
exports.getFreelanceMatches = async (req, res) => {
    try {
        // This would integrate with Upwork/Fiverr APIs. Dummy data for now.
        const freelanceTasks = [
            { task_id: 'task1', title: 'Build a landing page', description: 'Create a responsive landing page using HTML and CSS.', platform: 'Upwork', budget_usd: 100 }
        ];

        for (let task of freelanceTasks) {
            const prompt = `Extract the required skills from this task description: "${task.description}". Return as a JSON array of strings.`;
            const geminiResponse = await callGeminiAPI(prompt);
            task.required_skills = JSON.parse(geminiResponse.replace(/```json\n|\n```/g, ''));
        }

        res.status(200).json({ success: true, data: { matches: freelanceTasks } });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

// FR8.6: Interactive Role-Play Simulations
exports.startRolePlay = async (req, res) => {
    try {
        const { student_id, scenario_type } = req.body;
        const context = "You are a sales rep. A customer is angry about a billing error. Your goal is to calm them down and resolve the issue.";
        const opening_message = "Hello, I'm calling about my bill. It's completely wrong!";

        const newConversation = new RolePlayConversation({
            conversation_id: uuidv4(),
            student_id,
            scenario_type,
            conversation_history: [{ turn: 1, speaker: 'ai', message: opening_message, timestamp: new Date() }]
        });
        await newConversation.save();

        res.status(201).json({ success: true, data: { conversation_id: newConversation.conversation_id, scenario_context: context, opening_message: opening_message } });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

exports.respondRolePlay = async (req, res) => {
    try {
        const { conversation_id } = req.params;
        const { student_message } = req.body;

        const conversation = await RolePlayConversation.findOne({ conversation_id });
        if (!conversation) return res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Conversation not found.' } });

        const prompt = `You are role-playing as an angry customer. The student said: "${student_message}". Respond realistically.`;
        const geminiResponse = await callGeminiAPI(prompt);
        const ai_response = geminiResponse;

        conversation.conversation_history.push({ turn: conversation.conversation_history.length + 1, speaker: 'student', message: student_message, timestamp: new Date() });
        conversation.conversation_history.push({ turn: conversation.conversation_history.length + 1, speaker: 'ai', message: ai_response, timestamp: new Date() });
        await conversation.save();

        res.status(200).json({ success: true, data: { ai_response } });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};

exports.completeRolePlay = async (req, res) => {
    try {
        const { conversation_id } = req.params;
        const conversation = await RolePlayConversation.findOne({ conversation_id });
        if (!conversation) return res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Conversation not found.' } });

        const historyText = conversation.conversation_history.map(t => `${t.speaker}: ${t.message}`).join('\n');
        const prompt = `Analyze this role-play conversation: ${historyText}. Provide a final outcome and performance metrics (empathy, professionalism). Return as JSON.`;
        const geminiResponse = await callGeminiAPI(prompt);
        const analysis = JSON.parse(geminiResponse.replace(/```json\n|\n```/g, ''));

        conversation.performance_metrics = analysis;
        conversation.completed_at = new Date();
        await conversation.save();

        res.status(200).json({ success: true, data: conversation });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } });
    }
};
