import React from 'react';
import api from '../api';

const CareerSimulation = () => {
    const handleListCareers = async () => {
        try {
            const response = await api.get('/careers');
            alert('Careers listed successfully: ' + JSON.stringify(response.data));
        } catch (error) {
            alert('Error listing careers.');
        }
    };

    const handleGenerateScenario = async () => {
        try {
            const response = await api.post('/scenarios/generate', {
                career_track: 'software-dev',
                job_level: 'junior',
                skill_focus: ['React', 'Node.js'],
                industry_context: 'fintech'
            });
            console.log('Scenario generated:', response.data);
            alert('Scenario generated successfully!\n\n' + JSON.stringify(response.data.data, null, 2));
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating scenario: ' + (error.response?.data?.error?.message || error.message));
        }
    };

    return (
        <div>
            <h2>Career Simulation</h2>
            <button onClick={handleListCareers}>List Careers</button>
            <button onClick={handleGenerateScenario}>Generate Scenario</button>
        </div>
    );
};

export default CareerSimulation;
