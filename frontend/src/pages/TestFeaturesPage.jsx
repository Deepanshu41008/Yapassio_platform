import React, { useState } from 'react';
import api from '../services/api';

const TestFeaturesPage = () => {
    const [questionResult, setQuestionResult] = useState(null);
    const [scenarioResult, setScenarioResult] = useState(null);
    const [loading, setLoading] = useState({ questions: false, scenario: false });

    const handleGenerateQuestions = async () => {
        setLoading({ ...loading, questions: true });
        try {
            const response = await api.post('/questions/generate', {
                exam_id: 'UPSC',
                topic: 'Indian History',
                difficulty: 'medium',
                question_type: 'mcq',
                count: 5
            });
            setQuestionResult(response.data);
            console.log('✅ Questions generated:', response.data);
        } catch (error) {
            console.error('❌ Error:', error);
            setQuestionResult({ error: error.response?.data?.error?.message || error.message });
        } finally {
            setLoading({ ...loading, questions: false });
        }
    };

    const handleGenerateScenario = async () => {
        setLoading({ ...loading, scenario: true });
        try {
            const response = await api.post('/scenarios/generate', {
                career_track: 'software-dev',
                job_level: 'junior',
                skill_focus: ['React', 'Node.js'],
                industry_context: 'fintech'
            });
            setScenarioResult(response.data);
            console.log('✅ Scenario generated:', response.data);
        } catch (error) {
            console.error('❌ Error:', error);
            setScenarioResult({ error: error.response?.data?.error?.message || error.message });
        } finally {
            setLoading({ ...loading, scenario: false });
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Test AI Features</h1>
            
            {/* Question Generation Section */}
            <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2>📝 Generate Questions</h2>
                <button 
                    onClick={handleGenerateQuestions}
                    disabled={loading.questions}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading.questions ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading.questions ? 'Generating...' : 'Generate 5 Questions'}
                </button>
                
                {questionResult && (
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                        <h3>Result:</h3>
                        {questionResult.error ? (
                            <div style={{ color: 'red' }}>Error: {questionResult.error}</div>
                        ) : (
                            <div>
                                <div style={{ color: 'green', marginBottom: '10px' }}>
                                    ✅ Success! Generated {questionResult.data?.questions?.length} questions
                                </div>
                                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                                    {JSON.stringify(questionResult, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Scenario Generation Section */}
            <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2>🎯 Generate Career Scenario</h2>
                <button 
                    onClick={handleGenerateScenario}
                    disabled={loading.scenario}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading.scenario ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading.scenario ? 'Generating...' : 'Generate Scenario'}
                </button>
                
                {scenarioResult && (
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                        <h3>Result:</h3>
                        {scenarioResult.error ? (
                            <div style={{ color: 'red' }}>Error: {scenarioResult.error}</div>
                        ) : (
                            <div>
                                <div style={{ color: 'green', marginBottom: '10px' }}>
                                    ✅ Success! Scenario created: {scenarioResult.data?.scenario_title}
                                </div>
                                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                                    {JSON.stringify(scenarioResult, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestFeaturesPage;
