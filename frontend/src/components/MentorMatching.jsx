import React, { useState } from 'react';
import api from '../api';

const MentorMatching = () => {
    const [mentorUserId, setMentorUserId] = useState('');
    const [studentUserId, setStudentUserId] = useState('');

    const handleRegisterMentor = async () => {
        try {
            const response = await api.post('/mentors/register', {
                user_id: mentorUserId,
                mentor_type: 'industry',
                domains: ['machine learning', 'data science'],
                location: { city: 'San Francisco', state: 'CA', country: 'USA', coordinates: { lat: 37.7749, lng: -122.4194 } },
                availability_hours_per_week: 5,
                preferred_time_slots: ['monday_evening'],
                expertise_level: 'senior',
                years_of_experience: 10,
                bio: 'Experienced data scientist.',
                languages: ['English'],
                max_mentees: 2
            });
            alert('Mentor registered successfully!');
        } catch (error) {
            alert('Error registering mentor.');
        }
    };

    const handleRegisterStudent = async () => {
        try {
            await api.post('/students/profile', {
                user_id: studentUserId,
                domains_of_interest: ['machine learning'],
                career_goals: ['Become a data scientist'],
                location: { city: 'San Francisco', state: 'CA', country: 'USA', coordinates: { lat: 37.7749, lng: -122.4194 } },
                learning_style: 'hands_on',
                academic_level: 'postgrad',
                bio: 'Eager to learn data science.',
                languages: ['English']
            });
            alert('Student profile created successfully!');
        } catch (error) {
            alert('Error creating student profile.');
        }
    };

    return (
        <div>
            <h2>Mentor & Community Matching</h2>
            <div>
                <input type="text" value={mentorUserId} onChange={(e) => setMentorUserId(e.target.value)} placeholder="Mentor User ID" />
                <button onClick={handleRegisterMentor}>Register Mentor</button>
            </div>
            <div>
                <input type="text" value={studentUserId} onChange={(e) => setStudentUserId(e.target.value)} placeholder="Student User ID" />
                <button onClick={handleRegisterStudent}>Create Student Profile</button>
            </div>
        </div>
    );
};

export default MentorMatching;
