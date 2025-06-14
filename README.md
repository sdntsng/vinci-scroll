# ScrollNet - Gamified Video Feedback Platform

## 🚀 Project Status: Phase 1 (MVP) Development
**Current Focus**: Core video feed functionality with user authentication and feedback collection

## 📋 Project Overview

ScrollNet is a gamified video feedback and evaluation platform being developed in phases. The MVP focuses on establishing core functionality for user engagement with video content and feedback collection.

### MVP Features (Phase 1)
- ✅ User authentication system (login/register)
- ✅ Database-driven video feed
- ✅ Simple video player with reactions
- ✅ Feedback collection system (every 5 videos)
- ✅ Basic user engagement tracking

### Future Phases
- **Phase 2**: Enhanced UX & Analytics
- **Phase 3**: AI Integration (Inworld & Mistral)
- **Phase 4**: Advanced Gamification & RL Engine
- **Phase 5**: Admin & Tester Panels
- **Phase 6**: Production & Scaling

## 🏗️ MVP Architecture

```
ScrollNet MVP/
├── Authentication Service     # User registration/login
├── Video Feed Service        # Database-driven video delivery
├── Interaction Service       # Reactions and engagement tracking
└── Feedback Service          # Feedback collection every 5 videos
```

## 🛠️ MVP Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (for session management)

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd vinci-scroll

# Install dependencies
npm install

# Install additional MVP dependencies
npm install jsonwebtoken bcryptjs pg redis

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Environment Setup
Create a `.env` file with:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/scrollnet

# Authentication
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development
```

## 📊 Database Schema (MVP)

### Core Tables
- **users**: User authentication and profile data
- **videos**: Video metadata and content information
- **user_interactions**: Reactions, view duration, engagement metrics
- **feedback**: Detailed feedback collected every 5 videos

## 🔌 API Endpoints (MVP)

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile

### Video Feed
- `GET /videos/feed` - Get personalized video feed
- `GET /videos/:id` - Get specific video details
- `POST /videos/:id/view` - Track video view

### Interactions
- `POST /interactions/:videoId/react` - Submit reaction (like/dislike)
- `GET /interactions/stats` - Get user engagement statistics

### Feedback
- `POST /feedback` - Submit detailed feedback
- `GET /feedback/required` - Check if feedback is required

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:auth
npm run test:videos
npm run test:feedback
```

## 📁 Project Structure

```
scrollnet/
├── src/
│   ├── auth/                 # Authentication module
│   ├── videos/               # Video management
│   ├── interactions/         # User interactions
│   ├── feedback/             # Feedback system
│   ├── database/             # Database configuration
│   └── index.js              # Main server file
├── migrations/               # Database migrations
├── tests/                    # Test files
├── docs/                     # Documentation
├── PROJECT_PLAN.md          # Detailed phase planning
└── package.json             # Dependencies and scripts
```

## 🔮 Future AI Integration (Phase 3+)

### Planned AI Components
- **Inworld AI**: Character-based guidance and conversational feedback
- **Mistral AI**: Personalized content recommendations and analysis
- **Vision AI**: Advanced video content analysis and optimization

*Note: AI integrations are planned for Phase 3 and beyond. The MVP focuses on core functionality without AI dependencies.*

## 🔐 Security Features

- JWT-based authentication
- Input validation and sanitization
- SQL injection prevention
- Rate limiting on API endpoints
- HTTPS enforcement (production)

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📚 Documentation

- [Technical Documentation](.cursor/docs.md)
- [Development Rules](.cursor/rules)
- [Project Plan](PROJECT_PLAN.md)
- [API Documentation](docs/api.md) *(coming soon)*

## 🤝 Contributing

1. Follow the phase-based development approach outlined in `PROJECT_PLAN.md`
2. Review development rules in `.cursor/rules`
3. Update documentation with any changes
4. Ensure all tests pass before submitting PRs

## 📝 Development Status

### Phase 1 (MVP) Progress
- [ ] User authentication system
- [ ] Database schema implementation
- [ ] Video feed functionality
- [ ] Reaction system
- [ ] Feedback collection (every 5 videos)
- [ ] Basic user dashboard
- [ ] API endpoint implementation
- [ ] Test coverage
- [ ] Documentation completion

### Current Sprint
Focus on implementing core authentication and video feed functionality.

## 🐛 Known Issues

*Issues will be tracked here as development progresses*

## 📞 Support

For questions or issues related to the MVP development, please refer to the technical documentation or project plan.

---

**Note**: This is a phased development project. Current focus is on MVP completion before moving to advanced features and AI integration. 