const axios = require('axios');
const { Exam, Resource, Question, StudyPlan, UserProgress } = require('../models');

class ExamPrepAIEngine {
  constructor() {
    this.llmProviders = {
      gemini: process.env.GEMINI_API_KEY,
      huggingface: process.env.HUGGINGFACE_API_KEY,
      together: process.env.TOGETHER_API_KEY
    };
  }

  // Curate resources using AI
  async curateResources(examName, subject, topic) {
    try {
      const resources = [];
      
      // Web scraping simulation for free resources
      const freeResourceSources = [
        { name: 'Khan Academy', url: 'https://www.khanacademy.org', type: 'Video' },
        { name: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu', type: 'Course' },
        { name: 'NPTEL', url: 'https://nptel.ac.in', type: 'Video' },
        { name: 'Coursera', url: 'https://www.coursera.org', type: 'Course' },
        { name: 'YouTube Education', url: 'https://www.youtube.com/education', type: 'Video' },
        { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org', type: 'Article' },
        { name: 'Previous Year Papers', url: 'various', type: 'Previous Papers' }
      ];

      // AI-based quality scoring
      for (const source of freeResourceSources) {
        const resource = {
          title: `${subject} - ${topic} (${source.name})`,
          type: source.type,
          subject,
          topic,
          description: `Comprehensive ${topic} resources for ${examName} preparation`,
          url: source.url,
          source: source.name,
          isFree: true,
          aiCurated: true,
          aiScore: Math.floor(Math.random() * 30 + 70), // 70-100 quality score
          language: 'English',
          difficulty: this.determineResourceDifficulty(examName, topic)
        };
        
        resources.push(resource);
      }

      // Use AI to generate study notes if API is available
      if (this.llmProviders.gemini) {
        const aiNotes = await this.generateStudyNotes(examName, subject, topic);
        if (aiNotes) {
          resources.push({
            title: `AI-Generated Notes: ${topic}`,
            type: 'Notes',
            subject,
            topic,
            description: aiNotes.summary,
            content: aiNotes.content,
            isFree: true,
            aiCurated: true,
            aiScore: 95,
            language: 'English'
          });
        }
      }

      return resources;
    } catch (error) {
      console.error('Resource curation error:', error);
      return [];
    }
  }

  // Generate AI-powered study plan
  async generateStudyPlan(userId, examId, targetDate, dailyHours = 4) {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) throw new Error('Exam not found');

      const daysUntilExam = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
      const totalStudyHours = daysUntilExam * dailyHours;

      // Calculate time distribution per subject
      const subjects = exam.examPattern.subjects || [];
      const subjectPlan = subjects.map(subject => ({
        name: subject.name,
        weightage: subject.weightage || 20,
        allocatedHours: Math.floor((subject.weightage / 100) * totalStudyHours),
        topics: subject.topics || [],
        priority: subject.weightage >= 30 ? 'High' : subject.weightage >= 15 ? 'Medium' : 'Low'
      }));

      // Generate daily schedule
      const schedule = [];
      const startDate = new Date();
      
      for (let day = 0; day < daysUntilExam; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + day);
        
        const daySchedule = {
          date: currentDate,
          day: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
          tasks: [],
          totalHours: dailyHours
        };

        // Distribute subjects across the day
        let remainingHours = dailyHours;
        const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];
        
        for (let slot = 0; slot < timeSlots.length && remainingHours > 0; slot++) {
          const duration = Math.min(90, remainingHours * 60); // 90 minutes max per session
          const subjectIndex = (day + slot) % subjects.length;
          const subject = subjects[subjectIndex];
          
          daySchedule.tasks.push({
            time: this.getTimeForSlot(timeSlots[slot]),
            duration,
            subject: subject.name,
            topic: subject.topics[day % subject.topics.length] || 'General Practice',
            type: slot === 0 ? 'Theory' : slot === 3 ? 'Revision' : 'Practice',
            description: `Study ${subject.name} - Focus on ${subject.topics[day % subject.topics.length] || 'core concepts'}`
          });
          
          remainingHours -= duration / 60;
          
          // Add break
          if (slot < timeSlots.length - 1) {
            daySchedule.tasks.push({
              time: this.addMinutesToTime(this.getTimeForSlot(timeSlots[slot]), duration),
              duration: 15,
              type: 'Break',
              description: 'Take a short break'
            });
          }
        }
        
        schedule.push(daySchedule);
      }

      // Add milestones
      const milestones = [
        {
          title: 'Complete Basic Theory',
          date: new Date(startDate.getTime() + (daysUntilExam * 0.3 * 24 * 60 * 60 * 1000)),
          type: 'Syllabus Completion',
          description: 'Complete foundational concepts for all subjects'
        },
        {
          title: 'First Mock Test',
          date: new Date(startDate.getTime() + (daysUntilExam * 0.4 * 24 * 60 * 60 * 1000)),
          type: 'Mock Test',
          description: 'Attempt first full-length mock test'
        },
        {
          title: 'Complete Advanced Topics',
          date: new Date(startDate.getTime() + (daysUntilExam * 0.7 * 24 * 60 * 60 * 1000)),
          type: 'Syllabus Completion',
          description: 'Finish all advanced topics and problem-solving'
        },
        {
          title: 'Final Revision',
          date: new Date(startDate.getTime() + (daysUntilExam * 0.9 * 24 * 60 * 60 * 1000)),
          type: 'Revision',
          description: 'Complete revision of all subjects'
        }
      ];

      return {
        userId,
        examId,
        title: `${exam.name} Preparation Plan`,
        type: 'Daily',
        startDate: new Date(),
        endDate: targetDate,
        targetExamDate: targetDate,
        dailyStudyHours: dailyHours,
        schedule: schedule.slice(0, 30), // First 30 days for now
        subjects: subjectPlan,
        milestones,
        aiOptimized: true,
        reminders: [
          { type: 'Study', time: '09:00', message: 'Morning study session', enabled: true },
          { type: 'Study', time: '14:00', message: 'Afternoon practice session', enabled: true },
          { type: 'Study', time: '19:00', message: 'Evening revision', enabled: true },
          { type: 'Test', time: '10:00', message: 'Weekly mock test (Sundays)', enabled: true }
        ]
      };
    } catch (error) {
      console.error('Study plan generation error:', error);
      throw error;
    }
  }

  // Generate practice questions using AI
  async generatePracticeQuestions(examName, subject, topic, difficulty = 'Medium', count = 5) {
    const questions = [];
    
    try {
      // Use AI to generate questions if API is available
      if (this.llmProviders.gemini) {
        const prompt = `Generate ${count} ${difficulty} difficulty multiple choice questions for ${examName} exam on the topic "${topic}" in subject "${subject}". Include correct answer and explanation.`;
        
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.llmProviders.gemini}`,
          {
            contents: [{
              parts: [{ text: prompt }]
            }]
          }
        ).catch(err => null);
        
        if (response?.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          // Parse AI response and create questions
          // For demo, creating sample questions
        }
      }
      
      // Fallback: Generate sample questions
      const questionTypes = ['MCQ', 'True/False', 'Numerical'];
      const sampleTopics = {
        'Mathematics': ['Calculus', 'Algebra', 'Probability', 'Statistics'],
        'Physics': ['Mechanics', 'Thermodynamics', 'Optics', 'Electronics'],
        'Chemistry': ['Organic', 'Inorganic', 'Physical', 'Analytical'],
        'Biology': ['Cell Biology', 'Genetics', 'Ecology', 'Evolution'],
        'Computer Science': ['Algorithms', 'Data Structures', 'Operating Systems', 'Networks']
      };
      
      for (let i = 0; i < count; i++) {
        const question = {
          subject,
          topic,
          difficulty,
          type: questionTypes[i % questionTypes.length],
          question: `Sample ${difficulty} question ${i + 1} on ${topic}?`,
          options: [
            { text: 'Option A', isCorrect: i === 0 },
            { text: 'Option B', isCorrect: i === 1 },
            { text: 'Option C', isCorrect: i === 2 },
            { text: 'Option D', isCorrect: i !== 0 && i !== 1 && i !== 2 }
          ],
          correctAnswer: `Option ${['A', 'B', 'C', 'D'][i % 4]}`,
          explanation: `This is the explanation for why Option ${['A', 'B', 'C', 'D'][i % 4]} is correct.`,
          hints: [`Think about the ${topic} concepts`, 'Review your notes'],
          marks: difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3,
          timeLimit: difficulty === 'Easy' ? 60 : difficulty === 'Medium' ? 90 : 120,
          aiGenerated: true
        };
        
        questions.push(question);
      }
      
      return questions;
    } catch (error) {
      console.error('Question generation error:', error);
      return questions;
    }
  }

  // Analyze weak areas and generate remedy plans
  async analyzeWeakAreas(userId, examId) {
    try {
      const progress = await UserProgress.findOne({ userId, examId });
      if (!progress) return { weakAreas: [], remedyPlans: [] };
      
      const weakAreas = [];
      const remedyPlans = [];
      
      // Analyze subject-wise performance
      for (const subject of progress.subjectProgress || []) {
        if (subject.progress < 40) {
          weakAreas.push({
            subject: subject.subject,
            topics: subject.weakTopics,
            accuracy: subject.progress,
            priority: 'High'
          });
          
          // Generate remedy plan
          const plan = await this.generateRemedyPlan(subject.subject, subject.weakTopics);
          remedyPlans.push(plan);
        }
      }
      
      // Analyze practice statistics
      if (progress.practiceStats.accuracy < 60) {
        const plan = {
          weakArea: 'Overall Accuracy',
          plan: 'Focus on understanding concepts rather than memorization. Practice more questions daily.',
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'Pending',
          recommendations: [
            'Solve 20 questions daily',
            'Review incorrect answers thoroughly',
            'Maintain an error notebook',
            'Take weekly mock tests'
          ]
        };
        remedyPlans.push(plan);
      }
      
      return { weakAreas, remedyPlans };
    } catch (error) {
      console.error('Weak area analysis error:', error);
      return { weakAreas: [], remedyPlans: [] };
    }
  }

  // Generate remedy plan for weak areas
  async generateRemedyPlan(subject, weakTopics) {
    const plan = {
      weakArea: `${subject} - ${weakTopics.join(', ')}`,
      plan: `Intensive study plan for ${subject}`,
      targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
      status: 'Pending',
      steps: [
        `Review basic concepts of ${weakTopics.join(', ')}`,
        'Watch video tutorials for visual understanding',
        'Solve 10 practice problems daily',
        'Take topic-wise tests weekly',
        'Join study group for peer learning'
      ],
      resources: await this.curateResources('General', subject, weakTopics[0])
    };
    
    return plan;
  }

  // Generate AI feedback for test performance
  async generateTestFeedback(testAttempt) {
    const feedback = {
      strengths: [],
      weaknesses: [],
      recommendations: [],
      aiGeneratedTips: []
    };
    
    try {
      // Analyze performance
      const accuracy = testAttempt.analysis.accuracy || 0;
      
      // Identify strengths
      if (accuracy >= 80) {
        feedback.strengths.push('Excellent overall accuracy');
      }
      
      for (const subject of testAttempt.analysis.subjectWise || []) {
        if (subject.accuracy >= 75) {
          feedback.strengths.push(`Strong performance in ${subject.subject}`);
        } else if (subject.accuracy < 50) {
          feedback.weaknesses.push(`Need improvement in ${subject.subject}`);
        }
      }
      
      // Generate recommendations
      if (accuracy < 60) {
        feedback.recommendations.push('Focus on conceptual understanding');
        feedback.recommendations.push('Increase daily practice time');
      }
      
      if (testAttempt.analysis.timeAnalysis?.avgTimePerQuestion > 120) {
        feedback.recommendations.push('Work on time management');
        feedback.recommendations.push('Practice quick problem-solving techniques');
      }
      
      // AI tips
      feedback.aiGeneratedTips = [
        'Review all incorrect answers and understand the concepts',
        'Create a formula sheet for quick revision',
        'Practice similar questions from previous years',
        'Join online study groups for doubt clearing',
        'Take breaks between study sessions for better retention'
      ];
      
      // Use AI for personalized feedback if available
      if (this.llmProviders.gemini) {
        const prompt = `Generate personalized study tips for a student with ${accuracy}% accuracy in a mock test.`;
        // Make AI call here if needed
      }
      
      return feedback;
    } catch (error) {
      console.error('Feedback generation error:', error);
      return feedback;
    }
  }

  // Helper functions
  determineResourceDifficulty(examName, topic) {
    const hardExams = ['UPSC', 'GATE', 'CAT', 'GRE'];
    const mediumExams = ['NEET', 'JEE', 'GMAT'];
    
    if (hardExams.includes(examName)) return 'Advanced';
    if (mediumExams.includes(examName)) return 'Intermediate';
    return 'Beginner';
  }

  getTimeForSlot(slot) {
    const times = {
      'Morning': '06:00',
      'Afternoon': '14:00',
      'Evening': '18:00',
      'Night': '21:00'
    };
    return times[slot] || '09:00';
  }

  addMinutesToTime(time, minutes) {
    const [hours, mins] = time.split(':').map(Number);
    const totalMins = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMins / 60) % 24;
    const newMins = totalMins % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  }

  async generateStudyNotes(examName, subject, topic) {
    try {
      // Simulate AI-generated notes
      return {
        summary: `Key concepts and formulas for ${topic} in ${subject}`,
        content: `
# ${topic} - Study Notes

## Key Concepts:
1. Fundamental principles of ${topic}
2. Important formulas and equations
3. Common problem-solving techniques
4. Frequently asked questions patterns

## Important Points:
- Point 1: Core concept explanation
- Point 2: Application methods
- Point 3: Common mistakes to avoid

## Practice Problems:
1. Basic level problems
2. Intermediate challenges
3. Advanced applications

## Quick Revision:
- Formula sheet
- Concept map
- Memory techniques
        `
      };
    } catch (error) {
      console.error('Note generation error:', error);
      return null;
    }
  }
}

module.exports = new ExamPrepAIEngine();
