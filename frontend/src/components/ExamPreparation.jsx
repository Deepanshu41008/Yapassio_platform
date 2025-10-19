import React from 'react';
import api from '../api';

const ExamPreparation = () => {
    const handleListExams = async () => {
        try {
            const response = await api.get('/exams');
            alert('Exams listed successfully: ' + JSON.stringify(response.data));
        } catch (error) {
            alert('Error listing exams.');
        }
    };

    const handleGenerateQuestions = async () => {
        try {
            const response = await api.post('/questions/generate', {
                exam_id: 'UPSC',
                topic: 'Indian History',
                difficulty: 'medium',
                question_type: 'mcq',
                count: 5
            });
            console.log('Questions generated:', response.data);
            alert('Questions generated successfully!\n\n' + JSON.stringify(response.data.data.questions, null, 2));
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating questions: ' + (error.response?.data?.error?.message || error.message));
        }
    };

    return (
        <div>
            <h2>Exam Preparation Assistant</h2>
            <button onClick={handleListExams}>List Exams</button>
            <button onClick={handleGenerateQuestions}>Generate Questions</button>
        </div>
    );
};

export default ExamPreparation;
