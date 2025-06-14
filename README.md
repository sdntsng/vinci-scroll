# ScrollNet - Gamified Video Feedback and Evaluation Platform

ScrollNet is a cutting-edge platform that revolutionizes how video content is tested, optimized, and evaluated by integrating AI and gamification technologies. The platform captures granular engagement data and employs AI to generate insights and optimize content delivery through reinforcement learning.

## 🎯 Overview

ScrollNet functions as:
- **Feedback and Reinforcement Learning Engine**: Adapts and optimizes content delivery based on user engagement
- **Evaluation Engine**: Human-in-the-loop interactions for vision AI refinement  
- **Gamified Experience**: AI-driven challenges, rewards, and quests to incentivize user engagement

## 🚀 Key Features

- **AI-Powered Challenges**: Dynamic challenge generation using Mistral AI
- **Interactive Characters**: Gamified experience with Inworld AI characters
- **Vision AI Integration**: Human feedback improves AI model performance
- **Reinforcement Learning**: Adaptive content recommendations
- **Real-time Analytics**: Comprehensive feedback processing and insights
- **Progressive Difficulty**: Challenge complexity adapts to user skill level

## 🏗️ Architecture

```
ScrollNet/
├── .cursor/              # Cursor IDE configuration
│   ├── rules            # Development rules and standards
│   └── docs.md          # Comprehensive documentation
├── src/                 # Source code
│   ├── index.js         # Main application entry point
│   ├── inworld.js       # Inworld AI client integration
│   ├── mistral.js       # Mistral AI integration
│   ├── challenges.js    # Challenge generation logic
│   ├── RLengine.js      # Reinforcement learning engine
│   ├── userFeedback.js  # User feedback processing
│   └── visionAI.js      # Vision AI evaluation logic
├── package.json         # Node.js dependencies
└── README.md           # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Inworld Studio account
- Mistral API access

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd vinci-scroll
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Inworld AI Configuration
   INWORLD_API_KEY=your_inworld_api_key_here
   INWORLD_SCENE_ID=your_inworld_scene_id_here

   # Mistral AI Configuration
   MISTRAL_API_KEY=your_mistral_api_key_here
   MISTRAL_BASE_URL=https://api.mistral.ai/v1
   MISTRAL_MODEL=mistral-large-latest
   ```

4. **Set up Inworld AI**
   - Sign up at [Inworld Studio](https://studio.inworld.ai/)
   - Create a new scene and obtain your API key and scene ID
   - Add these credentials to your `.env` file

5. **Set up Mistral AI**
   - Obtain Mistral API credentials from hackathon documentation
   - Add your API key to the `.env` file

### Running the Application

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your environment).

## 📚 API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and version information.

### Challenge Management
```
GET /api/challenge/:userId
```
Generate a personalized challenge for a user.

```
POST /api/feedback
```
Submit user feedback for video content processing.

### AI Interactions
```
POST /api/npc/interact
```
Interact with AI characters for guidance and gamification.

### User Progress
```
GET /api/user/:userId/progress
```
Get user progress statistics and achievements.

```
GET /api/recommendations/:userId
```
Get AI-optimized content recommendations.

## 🎮 Core Components

### 1. Challenge Manager (`challenges.js`)
- Generates personalized video evaluation challenges
- Implements reward system with streak multipliers
- Adapts difficulty based on user performance
- Integrates with Mistral AI for dynamic content

### 2. Inworld AI Client (`inworld.js`)
- Manages AI character interactions
- Provides challenge guidance and feedback
- Handles fallback responses for offline scenarios
- Supports emotional and contextual responses

### 3. Mistral Integration (`mistral.js`)
- Generates dynamic challenges based on user history
- Creates content optimization suggestions
- Provides personalized feedback and coaching
- Supports both API and mock modes

### 4. Reinforcement Learning Engine (`RLengine.js`)
- Adapts content delivery based on user behavior
- Learns user preferences and patterns
- Generates personalized recommendations
- Implements exploration vs exploitation strategies

### 5. User Feedback Processor (`userFeedback.js`)
- Processes and analyzes user feedback
- Calculates quality scores and rewards
- Tracks user progress and achievements
- Implements sentiment analysis

### 6. Vision AI Processor (`visionAI.js`)
- Manages human-in-the-loop AI training
- Compares human vs AI performance
- Identifies areas for model improvement
- Processes visual annotations and feedback

## 🔧 Development

### Code Style
- ES6+ syntax with async/await
- Comprehensive error handling
- JSDoc documentation for all functions
- Meaningful variable and function names

### Testing
```bash
npm test
```

### Development Mode
```bash
npm run dev
```
Runs the server with auto-reload on file changes.

### Linting
```bash
npm run lint
```

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:
- `INWORLD_API_KEY` and `INWORLD_SCENE_ID`
- `MISTRAL_API_KEY`
- `PORT` (defaults to 3000)
- `NODE_ENV` (set to 'production')

### Production Build
```bash
npm run build
npm start
```

## 📊 Monitoring and Analytics

The platform includes built-in analytics for:
- User engagement metrics
- Challenge completion rates
- AI model performance
- Feedback quality scores
- Learning progress tracking

## 🔒 Security

- API key management through environment variables
- Input validation and sanitization
- Rate limiting on API endpoints
- Error handling without data exposure

## 🤝 Contributing

1. Follow the development rules in `.cursor/rules`
2. Maintain comprehensive documentation
3. Include tests for new features
4. Use meaningful commit messages

## 📖 Documentation

Comprehensive documentation is available in `.cursor/docs.md`, including:
- Detailed API specifications
- Component architecture explanations
- Troubleshooting guides
- Development workflows

## 🔗 External Resources

- [Inworld Studio Documentation](https://studio.inworld.ai/)
- [Inworld Unreal Engine Framework](https://docs.inworld.ai/)
- [Mistral AI Documentation](https://docs.mistral.ai/)
- [Node.js Official Documentation](https://nodejs.org/docs/)

## 📄 License

This project is developed for educational and hackathon purposes.

## 🆘 Support

For issues and questions:
1. Check the documentation in `.cursor/docs.md`
2. Review the troubleshooting section
3. Examine the server logs for error details
4. Verify environment variable configuration

---

**ScrollNet** - Revolutionizing video content evaluation through AI and gamification. 🎮🤖 