# ScrollNet Technical Documentation

## Project Status: Phase 1 (MVP) Development - Mobile-First Swipe Interface
**Current Focus**: Mobile-optimized video engagement with Tinder-like swipe interactions

## Architecture Overview

### Phase-Based Development Architecture

```
ScrollNet Platform
├── Phase 1: MVP (CURRENT) - Mobile-First Swipe Interface
│   ├── User Authentication System
│   ├── Swipe Video Feed (Tinder-like UX)
│   │   ├── Swipe Right = Like
│   │   ├── Swipe Left = Dislike  
│   │   ├── Swipe Up = Next Video
│   │   └── Emoji Reactions (8 different emotions)
│   ├── Mobile Video Player with Full-Screen Experience
│   ├── Feedback Collection (every 5 videos)
│   └── Progress Tracking with Visual Indicators
├── Phase 2: Enhanced UX & Analytics
├── Phase 3: AI Integration (Inworld + Mistral)
├── Phase 4: Advanced RL & Gamification
├── Phase 5: Admin & Tester Panels
└── Phase 6: Production & Scaling
```

## MVP (Phase 1) Technical Specifications

### Mobile-First Swipe Interface

#### Core Components
1. **SwipeVideoPlayer** (`/components/SwipeVideoPlayer.tsx`)
   - **Tinder-like Interactions**: Card-based swipe interface
   - **Gesture Controls**:
     - ← Swipe Left: Dislike video
     - → Swipe Right: Like video
     - ↑ Swipe Up: Next video
     - Tap: Play/Pause
   - **Emoji Reactions**: 8 emotional responses (❤️😂😍🤔🔥👏😮💯)
   - **Full-Screen Mobile Experience**: Optimized for portrait viewing
   - **Visual Feedback**: Real-time swipe indicators and reaction animations
   - **Progress Indicators**: Video counter and progress bars

2. **Authentication Service** (`/auth`)
   - Mobile-optimized login/register forms
   - JWT token management
   - Local storage persistence
   - Simulated authentication for MVP

3. **Video Feed System** (`/components/VideoFeed.tsx`)
   - Database-driven video queue
   - Automatic video progression
   - Reaction tracking and storage
   - Error handling with graceful fallbacks

4. **Feedback System** (`/components/FeedbackModal.tsx`)
   - Triggered every 5 videos
   - Multi-category rating system
   - Text feedback collection
   - Mobile-optimized modal interface

### Technology Stack

#### Frontend (Mobile-First)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with mobile-first responsive design
- **Interactions**: Swiper.js for touch-based interactions
- **State Management**: React hooks (useState, useEffect)
- **TypeScript**: Full type safety

#### Swiper Integration
```bash
npm install swiper
```

**Key Features**:
- EffectCards module for card-stack visual
- Touch event handling for gesture recognition
- Smooth transitions and animations
- Mobile gesture optimization

#### Backend (MVP Simplified)
- **Runtime**: Node.js with Express.js
- **Port**: 3001 (backend) / 3000 (frontend)
- **Logging**: Winston for structured logging
- **CORS**: Enabled for frontend communication

### Mobile UX Design Principles

#### 1. **Touch-First Interface**
- Primary interaction through swipe gestures
- Large touch targets for buttons (min 44px)
- Haptic feedback simulation through visual cues

#### 2. **Full-Screen Video Experience**
- Portrait-optimized video player
- Overlay controls with backdrop blur
- Gradient overlays for text readability

#### 3. **Gesture-Based Navigation**
- Intuitive swipe directions
- Visual feedback during gestures
- Clear instruction overlay on first use

#### 4. **Emoji-Driven Engagement**
- 8 emotional reactions available
- Grid-based selection interface
- Animated feedback on selection

### API Endpoints (MVP)

#### Video Interactions
```
POST /api/interactions/:videoId/react
Body: {
  reaction: 'like' | 'dislike' | 'emoji',
  data?: { emoji: string, key: string, label: string },
  timestamp: string
}
```

#### Feedback Collection
```
POST /api/feedback
Body: {
  videoId: string,
  rating: number,
  categories: {
    content_quality: number,
    engagement: number,
    relevance: number,
    technical_quality: number
  },
  wouldRecommend: boolean,
  comments: string,
  improvementSuggestions: string
}
```

### Component Architecture

```
src/
├── app/
│   └── page.tsx                 # Main mobile app entry
├── components/
│   ├── SwipeVideoPlayer.tsx     # Core swipe interface
│   ├── VideoFeed.tsx           # Video management
│   ├── LoginForm.tsx           # Mobile auth forms
│   ├── Header.tsx              # Minimal mobile header
│   └── FeedbackModal.tsx       # Mobile feedback collection
└── styles/
    └── globals.css             # Tailwind + custom mobile styles
```

### Mobile Performance Optimizations

1. **Video Loading**
   - Preload metadata only
   - Lazy loading for non-current videos
   - Thumbnail fallbacks

2. **Touch Responsiveness**
   - Event delegation for smooth scrolling
   - Debounced gesture recognition
   - Hardware acceleration via CSS transforms

3. **Memory Management**
   - Cleanup video refs on component unmount
   - Limited concurrent video elements
   - Efficient state updates

### Swipe Interaction Flow

```mermaid
graph TD
    A[User Swipes] --> B{Swipe Direction}
    B -->|Left| C[Dislike Video]
    B -->|Right| D[Like Video]
    B -->|Up| E[Next Video]
    C --> F[Visual Feedback]
    D --> F
    E --> F
    F --> G[Track Interaction]
    G --> H[Progress to Next Video]
    
    I[Emoji Button Tap] --> J[Show Emoji Grid]
    J --> K[User Selects Emoji]
    K --> L[Record Emoji Reaction]
    L --> F
```

### Development Environment

#### Frontend Development
```bash
cd frontend
npm run dev      # Start Next.js dev server (port 3000)
```

#### Backend Development
```bash
npm run dev:backend   # Start Express server (port 3001)
```

#### Full-Stack Development
```bash
npm run dev          # Start both frontend and backend
```

### Mobile Testing

#### Recommended Testing
1. **Chrome DevTools Mobile Emulation**
   - iPhone SE, iPhone 12 Pro, Samsung Galaxy
   - Portrait orientation focus
   - Touch event simulation

2. **Physical Device Testing**
   - iOS Safari
   - Android Chrome
   - Touch gesture responsiveness

#### Key Mobile Metrics
- **First Contentful Paint**: < 2s
- **Touch Response Time**: < 100ms
- **Video Load Time**: < 3s
- **Gesture Recognition Accuracy**: > 95%

### Error Handling & Fallbacks

1. **Network Issues**: Local reaction storage with sync on reconnect
2. **Video Load Failures**: Thumbnail placeholder with retry option
3. **Touch Detection Issues**: Button fallbacks for all gestures
4. **API Failures**: Graceful degradation to offline mode

### Security Considerations (MVP)

1. **Authentication**: Simulated JWT for development
2. **Video Sources**: HTTPS-only content URLs
3. **User Data**: Local storage with planned server migration
4. **CORS**: Restricted to localhost for development

### Future Enhancements (Post-MVP)

1. **Advanced Gestures**: Multi-finger interactions, pressure sensitivity
2. **Video Analytics**: Watch time, replay behavior, engagement patterns
3. **Social Features**: Share reactions, collaborative viewing
4. **Offline Mode**: Download videos for offline viewing
5. **AI Integration**: Personalized video recommendations based on swipe patterns

---

## Development Guidelines

### Mobile-First Development Rules
1. Design for mobile portrait first, then scale up
2. Test every feature on actual mobile devices
3. Prioritize touch interactions over click events
4. Maintain 60fps during animations and transitions
5. Keep bundle size minimal for mobile performance

### Code Organization
- All components must be mobile-responsive by default
- Use TypeScript for all new components
- Follow React hooks patterns for state management
- Implement proper error boundaries for graceful failures
- Document all swipe interactions with clear comments

### Performance Standards
- Page load time: < 2 seconds on 3G
- Touch response: < 100ms
- Video start time: < 3 seconds
- Smooth animations: 60fps minimum

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