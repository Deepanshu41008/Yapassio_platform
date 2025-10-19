# YAPASSIO - AI-Powered Student Platform# AI-Powered Student Platform



An intelligent career guidance and exam preparation platform powered by AI, helping students with mentor matching, exam preparation, and career simulations.This project is a MERN stack application that provides an AI-powered platform for students, featuring mentor matching, exam preparation, and career simulation.



## 🚀 Features## Features



### Core AI Features- **Mentor & Community Matching Engine:** Connects students with mentors and peer learning circles.

- **📝 Question Generation**: AI-powered practice question generation for exam preparation- **Exam Preparation Assistant:** Provides personalized study plans, practice questions, and weak area analysis.

- **🎯 Career Scenario Generation**: Realistic workplace simulation scenarios- **Career Simulation & Project-Based Preview:** Offers virtual internship experiences and real-world project simulations.

- **👥 Mentor Matching**: Intelligent matching between students and mentors

- **📚 Exam Preparation**: Personalized study plans and resource curation## Tech Stack

- **💼 Career Simulation**: Virtual internships and role-play exercises

- **Frontend:** React

## 📋 Prerequisites- **Backend:** Node.js, Express

- **Database:** MongoDB

- **Node.js** v16 or higher- **Caching:** Redis

- **MongoDB** (local or cloud instance)- **AI:** Google Gemini API

- **npm** or **yarn**

## Getting Started

## 🛠️ Installation

### Prerequisites

### 1. Clone the repository

```bash- Node.js

git clone <repository-url>- npm

cd YAPASSIO-main- MongoDB

```- Redis

- Docker (optional)

### 2. Backend Setup

```bash### Installation

cd backend

npm install1.  **Clone the repository:**

cp .env.example .env    ```bash

# Edit .env with your configuration    git clone <repository-url>

npm start    ```

```2.  **Backend Setup:**

    ```bash

Backend runs on: `http://localhost:3000`    cd backend

    npm install

### 3. Frontend Setup    copy .env.example .env

```bash    # Add your Gemini API key and other environment variables to .env

cd frontend    # For Windows: copy .env.example .env

npm install    # For Linux/Mac: cp .env.example .env

npm run dev    ```

```3.  **Frontend Setup:**

    ```bash

Frontend runs on: `http://localhost:5173`    cd frontend

    npm install

## ⚙️ Configuration    ```



Create a `.env` file in the `backend` directory (use `.env.example` as template):### Running the Application



```env1.  **Start the backend:**

# Server    ```bash

PORT=3000    cd backend

NODE_ENV=development    node server.js

    # OR use: npm start

# Database    ```

MONGODB_URI=mongodb://localhost:27017/student_platform    Backend will be available at: http://localhost:3000



# JWT Secret2.  **Start the frontend (in a NEW terminal):**

JWT_SECRET=your-secret-key    ```bash

    cd frontend

# AI Configuration    npm run dev

USE_MOCK_AI=true  # Set to false when using real Gemini API    # Note: Frontend uses Vite, so it's "npm run dev" NOT "npm start"

GEMINI_API_KEY=your-api-key-here    ```

```    Frontend will be available at: http://localhost:5173



## 🎯 Using the AI Features### Docker (Optional)



### Generate QuestionsYou can use Docker to run the entire application stack.

```javascript

POST /api/v1/questions/generate```bash

{cd backend

  "exam_id": "UPSC",docker-compose up

  "topic": "Indian History",```

  "difficulty": "medium",

  "question_type": "mcq",## API Documentation

  "count": 5

}The API documentation is available at `/api-docs` when the backend is running.

```

## Testing

### Generate Career Scenario

```javascript### Running All Tests

POST /api/v1/scenarios/generate

{To run the complete test suite:

  "career_track": "software-dev",

  "job_level": "junior",```bash

  "skill_focus": ["React", "Node.js"],cd backend

  "industry_context": "fintech"npm test

}```

```

### Windows Quick Test Script

## 📁 Project Structure

For Windows users, you can use the automated test script:

```

YAPASSIO-main/```bash

├── backend/cd backend

│   ├── controllers/       # API controllersrun-tests.bat

│   ├── models/           # Database models```

│   ├── routes/           # API routes

│   ├── services/         # Business logicThis script will:

│   ├── middleware/       # Authentication, etc.- Create `.env` file from `.env.example` if it doesn't exist

│   ├── utils/            # Helper functions (AI integration)- Install dependencies if needed

│   └── server.js         # Entry point- Run all test suites

│

└── frontend/### Test Coverage

    ├── src/

    │   ├── components/   # React componentsView test coverage report:

    │   ├── pages/        # Page components

    │   ├── services/     # API calls```bash

    │   └── App.jsx       # Main appcd backend

    └── index.htmlnpm test -- --coverage

``````



## 🧪 TestingCoverage reports are generated in the `backend/coverage` directory.



The application includes a test interface at the top of the homepage where you can:### Running Specific Test Suites

- Generate practice questions

- Create career scenarios```bash

- View results in real-time# Run integration tests only

npm test -- integration.test.js

## 🔒 Security Notes

# Run mentor matching tests only

- Never commit `.env` files to version controlnpm test -- mentorMatching.test.js

- Change JWT_SECRET in production

- Use environment-specific configurations# Run exam preparation tests only

- Keep API keys securenpm test -- examPreparation.test.js



## 📝 API Documentation# Run career simulation tests only

npm test -- careerSimulation.test.js

### Health Check

```# Run API endpoint tests only

GET /api/v1/healthnpm test -- api.test.js

``````



### Exam Preparation### Test Features Coverage

- `GET /api/v1/exams` - List all exams

- `POST /api/v1/questions/generate` - Generate questionsThe test suite covers:

- `POST /api/v1/study-plans/generate` - Create study plan- ✅ **Health Check & System Status**

- ✅ **Mentor Matching Engine**

### Career Simulation  - Mentor registration

- `GET /api/v1/careers` - List career tracks  - Student profile creation

- `POST /api/v1/scenarios/generate` - Generate scenario  - AI-powered matching algorithm

- `POST /api/v1/simulations/start` - Start simulation  - Profile recommendations

- ✅ **Exam Preparation Assistant**

### Mentor Matching  - Exam listing and management

- `GET /api/v1/mentors` - List mentors  - Question generation

- `POST /api/v1/matching-requests` - Request mentor match  - Study plan creation

  - Weak area analysis

## 🤝 Contributing  - Practice test submissions

- ✅ **Career Simulation**

1. Fork the repository  - Career track listing

2. Create a feature branch  - Scenario generation

3. Make your changes  - Simulation execution

4. Submit a pull request  - Progress tracking

  - Task evaluation

## 📄 License- ✅ **Authentication & User Management**

  - User registration

This project is licensed under the MIT License.  - Login functionality

  - JWT token generation

## 🙏 Acknowledgments- ✅ **API Error Handling**

  - 404 handling

- Google Gemini AI for intelligent content generation  - Validation errors

- MongoDB for database solutions  - Malformed request handling

- React and Node.js communities- ✅ **Performance Testing**

  - Response time validation

---  - Load handling



**Note**: This project uses mock AI responses by default. To use real AI features, obtain a Google Gemini API key and set `USE_MOCK_AI=false` in your `.env` file.### Environment Variables for Testing


The test suite uses in-memory MongoDB (mongodb-memory-server) and mocked external APIs. No real API keys are required for testing, but you should configure them for production use in your `.env` file:

```env
# Required for production
GEMINI_API_KEY=your-actual-gemini-api-key
GOOGLE_API_KEY=your-actual-google-api-key
MONGODB_URI=your-mongodb-connection-string
REDIS_URL=your-redis-connection-string
JWT_SECRET=your-secure-jwt-secret
```
