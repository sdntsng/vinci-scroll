# ScrollNet Technical Documentation

## Project Status: Phase 1 (MVP) Planning
**Current Focus**: Core functionality development without AI integrations

## Architecture Overview

### Phase-Based Development Architecture

```
ScrollNet Platform
├── Phase 1: MVP (CURRENT)
│   ├── User Authentication System
│   ├── Video Feed System (Database-driven)
│   ├── Basic Video Player
│   ├── Simple Reaction System
│   └── Feedback Collection (every 5 videos)
├── Phase 2: Enhanced UX & Analytics
├── Phase 3: AI Integration (Inworld + Mistral)
├── Phase 4: Advanced RL & Gamification
├── Phase 5: Admin & Tester Panels
└── Phase 6: Production & Scaling
```

## MVP (Phase 1) Technical Specifications

### Core Components
1. **Authentication Service** (`/auth`)
   - JWT-based authentication
   - User registration and login
   - Session management

2. **Video Service** (`/videos`)
   - Database-driven video feed
   - Sequential video delivery
   - Video metadata management

3. **Interaction Service** (`/interactions`)
   - Simple reaction tracking (like/dislike)
   - View duration tracking
   - Engagement metrics

4. **Feedback Service** (`/feedback`)
   - Feedback form trigger (every 5 videos)
   - Feedback data collection and storage
   - Basic feedback analytics

### Database Schema (MVP)
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Videos table
CREATE TABLE videos (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    duration INTEGER, -- in seconds
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User interactions table
CREATE TABLE user_interactions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    video_id UUID REFERENCES videos(id),
    reaction VARCHAR(20), -- 'like', 'dislike', 'neutral'
    watch_duration INTEGER, -- in seconds
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    video_id UUID REFERENCES videos(id),
    feedback_text TEXT,
    rating INTEGER, -- 1-5 scale
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints (MVP)

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user profile

#### Videos
- `GET /videos/feed` - Get video feed for user
- `GET /videos/:id` - Get specific video details
- `POST /videos/:id/view` - Track video view

#### Interactions
- `POST /interactions/:videoId/react` - Submit reaction
- `GET /interactions/stats` - Get user interaction stats

#### Feedback
- `POST /feedback` - Submit feedback
- `GET /feedback/required` - Check if feedback required

## Future Phases Architecture

### Phase 3: AI Integration Components
**Note: NOT part of MVP - for reference only**

#### Inworld AI Integration
- **Applicable Features**:
  - Character-based guidance for video evaluation
  - Natural language feedback collection
  - Dynamic challenge explanations
  - Personalized coaching based on performance

- **Implementation Strategy**:
  - Single AI guide character
  - Text-based interactions (no voice/3D avatars)
  - Context-aware responses based on user progress
  - Integration with feedback collection system

#### Mistral AI Integration
- **Applicable Features**:
  - Personalized content recommendations
  - User preference analysis
  - Challenge generation based on history
  - Content optimization suggestions

### Phase 5: Admin & Tester Panels
**Note: NOT part of MVP**

#### Admin Panel Features
- User management and analytics
- Content moderation tools
- System configuration
- Performance monitoring

#### Tester Panel Features
- Video upload interface
- Test configuration
- Results analysis
- Content management

## Development Setup (MVP)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (for session management)

### Installation
```bash
# Install dependencies
npm install

# Additional MVP dependencies
npm install jsonwebtoken bcryptjs pg redis

# Setup environment variables
cp .env.example .env
# Edit .env with database and JWT secret
```

### MVP Environment Variables
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/scrollnet

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development
```

### Running the MVP
```bash
# Start development server
npm run dev

# Run database migrations
npm run migrate

# Seed sample data
npm run seed
```

## Current File Structure
```
scrollnet/
├── src/
│   ├── index.js              # Main server (MVP focus)
│   ├── auth/                 # Authentication module
│   ├── videos/               # Video management
│   ├── interactions/         # User interactions
│   ├── feedback/             # Feedback system
│   └── database/             # Database configuration
├── migrations/               # Database migrations
├── tests/                    # Test files
├── docs/                     # Documentation
└── PROJECT_PLAN.md          # Phase planning
```

## AI Integration Status
**Current Status**: Prepared for Phase 3 implementation
- Inworld AI integration code exists but is NOT active in MVP
- Mistral AI integration prepared but NOT used in MVP
- Vision AI components prepared for Phase 4
- All AI features disabled in MVP configuration

## Troubleshooting (MVP)

### Common Issues
1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **Authentication**: Check JWT secret is properly configured
3. **Video Playback**: Verify video URLs are accessible
4. **Feedback Collection**: Ensure feedback triggers correctly every 5 videos

### Performance Considerations
- Use database indexing for video queries
- Implement pagination for video feeds
- Cache frequently accessed video metadata
- Optimize database queries for user interactions

## Security Considerations (MVP)
- JWT token validation on all protected routes
- Input validation for all user-submitted data
- SQL injection prevention with parameterized queries
- Rate limiting on API endpoints
- HTTPS enforcement in production

## Testing Strategy (MVP)
- Unit tests for all authentication functions
- Integration tests for video feed functionality
- User interaction flow testing
- Feedback collection system testing
- Database transaction testing

## Deployment (MVP)
- Containerized deployment with Docker
- Environment-specific configuration
- Database migration scripts
- Health check endpoints
- Logging and monitoring setup 