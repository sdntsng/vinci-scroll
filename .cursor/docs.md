# ScrollNet - Gamified Video Feedback and Evaluation Platform

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [API Integration](#api-integration)
5. [Core Components](#core-components)
6. [Development Workflow](#development-workflow)
7. [Troubleshooting](#troubleshooting)

## Project Overview

ScrollNet is a cutting-edge platform that combines gaming and AI technologies to create an interactive feedback and reinforcement learning engine. The platform serves as an evaluation engine with human-in-the-loop interactions for vision AI, enabling real-time content optimization and user engagement.

### Key Features
- **Feedback and Evaluation Engine**: Collects detailed user feedback on video content
- **Reinforcement Learning**: Adapts content delivery based on user engagement
- **Gamified Engagement**: AI-driven challenges, rewards, and quests
- **Vision AI Integration**: Human-in-the-loop processes for AI model refinement

## Architecture

```
ScrollNet/
├── src/
│   ├── index.js          # Main application entry point
│   ├── inworld.js        # Inworld AI client and functions
│   ├── mistral.js        # Mistral AI integration
│   ├── challenges.js     # Challenge generation logic
│   ├── RLengine.js       # Reinforcement learning engine
│   ├── userFeedback.js   # User feedback processing
│   └── visionAI.js       # Vision AI evaluation logic
├── tests/                # Test files
├── .cursor/              # Cursor IDE configuration
├── .env                  # Environment variables
└── package.json          # Node.js dependencies
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Cursor IDE
- Inworld Studio account
- Mistral API access

### Installation Steps
1. Clone or create the project directory
2. Run `npm init -y` to initialize Node.js project
3. Install dependencies: `npm install @inworld/nodejs-sdk`
4. Copy `.env.example` to `.env` and configure API keys
5. Run `npm start` to launch the application

## API Integration

### Inworld AI Setup
- Sign up at [Inworld Studio](https://studio.inworld.ai/)
- Create a new scene and obtain API key and scene ID
- Configure in `.env` file:
  ```
  INWORLD_API_KEY=your_api_key_here
  INWORLD_SCENE_ID=your_scene_id_here
  ```

### Mistral Integration
- Obtain Mistral API credentials from hackathon documentation
- Configure in `.env` file:
  ```
  MISTRAL_API_KEY=your_mistral_key_here
  ```

## Core Components

### 1. Inworld Client (`inworld.js`)
Handles communication with AI characters for gamified interactions.

### 2. Mistral Integration (`mistral.js`)
Generates dynamic challenges and content based on user behavior.

### 3. Reinforcement Learning Engine (`RLengine.js`)
Implements learning algorithms to optimize content delivery.

### 4. User Feedback System (`userFeedback.js`)
Processes and analyzes user interactions and feedback.

### 5. Vision AI Integration (`visionAI.js`)
Manages human-in-the-loop processes for AI model improvement.

## Development Workflow

1. **Feature Development**
   - Create feature branch from main
   - Implement functionality with tests
   - Update documentation
   - Submit pull request

2. **Testing Strategy**
   - Unit tests for individual components
   - Integration tests for AI workflows
   - Mock external API calls in tests
   - Test error handling scenarios

3. **Deployment Process**
   - Review code changes
   - Run full test suite
   - Update version in package.json
   - Deploy to staging environment
   - Validate functionality
   - Deploy to production

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify API keys in .env file
   - Check network connectivity
   - Validate API endpoint URLs

2. **Rate Limiting**
   - Implement exponential backoff
   - Add request queuing
   - Monitor API usage limits

3. **Performance Issues**
   - Profile code execution
   - Optimize database queries
   - Implement caching strategies

### Debug Tools
- Use Node.js debugger for step-through debugging
- Enable verbose logging in development
- Monitor API response times and errors
- Use profiling tools for performance analysis

## External Resources
- [Inworld Studio Documentation](https://studio.inworld.ai/)
- [Inworld Unreal Engine Framework](https://docs.inworld.ai/)
- [Node.js Official Documentation](https://nodejs.org/docs/)
- [Mistral AI Documentation](https://docs.mistral.ai/) 