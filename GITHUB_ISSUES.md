# ScrollNet GitHub Issues - Phased Development

## Phase 1: MVP (Minimum Viable Product) Issues

### Epic: User Authentication System
**Labels**: `phase-1`, `mvp`, `authentication`, `epic`

#### Issue #1: Implement JWT-Based Authentication System
**Labels**: `phase-1`, `mvp`, `backend`, `authentication`
**Priority**: High
**Assignee**: Backend Developer

**Description:**
Implement a secure JWT-based authentication system for user registration and login.

**Acceptance Criteria:**
- [ ] User registration endpoint (`POST /auth/register`)
- [ ] User login endpoint (`POST /auth/login`)
- [ ] JWT token generation and validation
- [ ] Password hashing with bcrypt
- [ ] Input validation for email and password
- [ ] Error handling for invalid credentials
- [ ] Session management with Redis

**Technical Requirements:**
- Use bcryptjs for password hashing
- Implement JWT with expiration
- Store session data in Redis
- Validate email format
- Enforce password strength requirements

---

#### Issue #2: Create User Profile Management
**Labels**: `phase-1`, `mvp`, `backend`, `authentication`
**Priority**: Medium
**Assignee**: Backend Developer

**Description:**
Create user profile management functionality for authenticated users.

**Acceptance Criteria:**
- [ ] Get current user profile endpoint (`GET /auth/me`)
- [ ] Update user profile endpoint (`PUT /auth/profile`)
- [ ] User logout functionality (`POST /auth/logout`)
- [ ] JWT middleware for protected routes
- [ ] User data validation

---

### Epic: Database Layer & Schema
**Labels**: `phase-1`, `mvp`, `database`, `epic`

#### Issue #3: Design and Implement Database Schema
**Labels**: `phase-1`, `mvp`, `database`, `backend`
**Priority**: High
**Assignee**: Backend Developer

**Description:**
Design and implement the database schema for the MVP functionality.

**Acceptance Criteria:**
- [ ] Create users table with proper constraints
- [ ] Create videos table with metadata fields
- [ ] Create user_interactions table for tracking reactions
- [ ] Create feedback table for detailed feedback storage
- [ ] Implement database migration scripts
- [ ] Add proper indexes for performance
- [ ] Set up foreign key relationships

**Database Tables:**
- `users` (id, username, email, password_hash, created_at, updated_at)
- `videos` (id, title, description, url, duration, tags, created_at)
- `user_interactions` (id, user_id, video_id, reaction, watch_duration, completed, created_at)
- `feedback` (id, user_id, video_id, feedback_text, rating, created_at)

---

#### Issue #4: Database Connection and Configuration
**Labels**: `phase-1`, `mvp`, `database`, `backend`
**Priority**: High
**Assignee**: Backend Developer

**Description:**
Set up database connection and configuration management.

**Acceptance Criteria:**
- [ ] PostgreSQL connection setup
- [ ] Environment-based configuration
- [ ] Connection pooling implementation
- [ ] Database health check endpoint
- [ ] Error handling for database failures
- [ ] Migration runner setup

---

### Epic: Video Feed System
**Labels**: `phase-1`, `mvp`, `video-feed`, `epic`

#### Issue #5: Implement Video Feed API
**Labels**: `phase-1`, `mvp`, `backend`, `video-feed`
**Priority**: High
**Assignee**: Backend Developer

**Description:**
Create the core video feed functionality that serves videos from the database.

**Acceptance Criteria:**
- [ ] Get video feed endpoint (`GET /videos/feed`)
- [ ] Pagination support for video feed
- [ ] Get single video endpoint (`GET /videos/:id`)
- [ ] Video metadata serving
- [ ] User-specific feed ordering
- [ ] Error handling for missing videos

**Technical Requirements:**
- Implement pagination (default 10 videos per page)
- Include video metadata (title, description, duration, tags)
- Support for various video formats
- Proper error responses

---

#### Issue #6: Video View Tracking
**Labels**: `phase-1`, `mvp`, `backend`, `analytics`
**Priority**: Medium
**Assignee**: Backend Developer

**Description:**
Implement video view tracking to monitor user engagement.

**Acceptance Criteria:**
- [ ] Track video view endpoint (`POST /videos/:id/view`)
- [ ] Record view duration
- [ ] Track completion status
- [ ] Prevent duplicate view counting
- [ ] Store viewing metadata

---

### Epic: User Interaction System
**Labels**: `phase-1`, `mvp`, `interactions`, `epic`

#### Issue #7: Implement Reaction System
**Labels**: `phase-1`, `mvp`, `backend`, `interactions`
**Priority**: High
**Assignee**: Backend Developer

**Description:**
Create a simple reaction system for videos (like/dislike).

**Acceptance Criteria:**
- [ ] Submit reaction endpoint (`POST /interactions/:videoId/react`)
- [ ] Support like/dislike reactions
- [ ] Update reaction if user changes mind
- [ ] Prevent duplicate reactions from same user
- [ ] Get user interaction stats endpoint (`GET /interactions/stats`)

**Reaction Types:**
- `like`
- `dislike`
- `neutral` (no reaction)

---

#### Issue #8: User Engagement Analytics
**Labels**: `phase-1`, `mvp`, `backend`, `analytics`
**Priority**: Low
**Assignee**: Backend Developer

**Description:**
Basic analytics for user engagement tracking.

**Acceptance Criteria:**
- [ ] Track total videos watched
- [ ] Calculate average watch duration
- [ ] Count total reactions given
- [ ] User engagement score calculation
- [ ] Personal stats endpoint for users

---

### Epic: Feedback Collection System
**Labels**: `phase-1`, `mvp`, `feedback`, `epic`

#### Issue #9: Implement Feedback Collection Logic
**Labels**: `phase-1`, `mvp`, `backend`, `feedback`
**Priority**: High
**Assignee**: Backend Developer

**Description:**
Create the core feedback collection system that triggers every 5 videos.

**Acceptance Criteria:**
- [ ] Track user video count for feedback triggers
- [ ] Check if feedback required endpoint (`GET /feedback/required`)
- [ ] Submit feedback endpoint (`POST /feedback`)
- [ ] Feedback form validation
- [ ] Store detailed feedback with ratings
- [ ] Reset counter after feedback submission

**Feedback Requirements:**
- Trigger after every 5 videos watched
- Include text feedback field
- Include 1-5 star rating
- Associate with specific video
- Optional additional metadata

---

#### Issue #10: Feedback Storage and Retrieval
**Labels**: `phase-1`, `mvp`, `backend`, `feedback`
**Priority**: Medium
**Assignee**: Backend Developer

**Description:**
Implement feedback storage and basic retrieval functionality.

**Acceptance Criteria:**
- [ ] Store feedback in database with proper relationships
- [ ] Basic feedback validation
- [ ] Get user's feedback history
- [ ] Feedback submission confirmation
- [ ] Error handling for invalid feedback

---

### Epic: Frontend Implementation
**Labels**: `phase-1`, `mvp`, `frontend`, `epic`

#### Issue #11: Create Authentication UI
**Labels**: `phase-1`, `mvp`, `frontend`, `authentication`
**Priority**: High
**Assignee**: Frontend Developer

**Description:**
Create user interface for registration and login functionality.

**Acceptance Criteria:**
- [ ] Login form component
- [ ] Registration form component
- [ ] Form validation
- [ ] JWT token storage and management
- [ ] Protected route implementation
- [ ] Error message display
- [ ] Responsive design

---

#### Issue #12: Implement Video Feed UI
**Labels**: `phase-1`, `mvp`, `frontend`, `video-feed`
**Priority**: High
**Assignee**: Frontend Developer

**Description:**
Create the main video feed interface for users.

**Acceptance Criteria:**
- [ ] Video player component
- [ ] Video feed list/grid view
- [ ] Basic video controls (play, pause, seek)
- [ ] Video metadata display
- [ ] Pagination controls
- [ ] Loading states
- [ ] Error handling for failed video loads

---

#### Issue #13: Create Reaction Interface
**Labels**: `phase-1`, `mvp`, `frontend`, `interactions`
**Priority**: High
**Assignee**: Frontend Developer

**Description:**
Implement the reaction interface for video interactions.

**Acceptance Criteria:**
- [ ] Like/dislike buttons
- [ ] Visual feedback for reactions
- [ ] Prevent multiple rapid submissions
- [ ] Update UI based on user's previous reactions
- [ ] Reaction count display (optional)

---

#### Issue #14: Implement Feedback Form UI
**Labels**: `phase-1`, `mvp`, `frontend`, `feedback`
**Priority**: High
**Assignee**: Frontend Developer

**Description:**
Create the feedback form that appears every 5 videos.

**Acceptance Criteria:**
- [ ] Modal/overlay feedback form
- [ ] Text area for detailed feedback
- [ ] Star rating component
- [ ] Form validation
- [ ] Submission confirmation
- [ ] Progress indicator (5 video countdown)
- [ ] Form submission handling

---

### Epic: Testing & Quality Assurance
**Labels**: `phase-1`, `mvp`, `testing`, `epic`

#### Issue #15: Backend API Testing
**Labels**: `phase-1`, `mvp`, `testing`, `backend`
**Priority**: High
**Assignee**: Backend Developer

**Description:**
Comprehensive testing for all backend API endpoints.

**Acceptance Criteria:**
- [ ] Unit tests for authentication endpoints
- [ ] Integration tests for video feed functionality
- [ ] Tests for reaction system
- [ ] Feedback collection testing
- [ ] Database transaction testing
- [ ] Error scenario testing
- [ ] Achieve 80%+ test coverage

---

#### Issue #16: Frontend Component Testing
**Labels**: `phase-1`, `mvp`, `testing`, `frontend`
**Priority**: Medium
**Assignee**: Frontend Developer

**Description:**
Testing for all frontend components and user flows.

**Acceptance Criteria:**
- [ ] Component unit tests
- [ ] User authentication flow testing
- [ ] Video playback testing
- [ ] Feedback form testing
- [ ] Integration tests with backend APIs
- [ ] E2E testing for critical user journeys

---

### Epic: Documentation & Deployment
**Labels**: `phase-1`, `mvp`, `documentation`, `epic`

#### Issue #17: API Documentation
**Labels**: `phase-1`, `mvp`, `documentation`
**Priority**: Medium
**Assignee**: Backend Developer

**Description:**
Create comprehensive API documentation for all endpoints.

**Acceptance Criteria:**
- [ ] Document all authentication endpoints
- [ ] Document video feed endpoints
- [ ] Document interaction endpoints
- [ ] Document feedback endpoints
- [ ] Include request/response examples
- [ ] Add error code documentation
- [ ] Interactive API documentation (Swagger/OpenAPI)

---

#### Issue #18: Deployment Setup
**Labels**: `phase-1`, `mvp`, `deployment`, `devops`
**Priority**: Medium
**Assignee**: DevOps Engineer

**Description:**
Set up deployment pipeline and infrastructure for MVP.

**Acceptance Criteria:**
- [ ] Docker containerization
- [ ] Environment configuration
- [ ] Database setup in production
- [ ] CI/CD pipeline setup
- [ ] Health check endpoints
- [ ] Logging and monitoring setup
- [ ] SSL certificate configuration

---

## Phase 2: Enhanced UX & Analytics Issues

### Epic: Enhanced Video Player
**Labels**: `phase-2`, `video-player`, `epic`

#### Issue #19: Advanced Video Player Features
**Labels**: `phase-2`, `frontend`, `video-player`
**Priority**: Medium

**Description:**
Enhance the video player with advanced controls and features.

**Acceptance Criteria:**
- [ ] Playback speed controls
- [ ] Video quality selection
- [ ] Fullscreen support
- [ ] Keyboard shortcuts
- [ ] Progress bar with thumbnails
- [ ] Volume controls

---

## Phase 3: AI Integration Issues

**Note**: These issues are for future reference and should not be worked on during MVP development.

### Epic: Inworld AI Integration
**Labels**: `phase-3`, `ai-integration`, `inworld`, `epic`

#### Issue #20: Basic Inworld Character Integration
**Labels**: `phase-3`, `ai-integration`, `inworld`
**Priority**: Future

**Description:**
Integrate Inworld AI for character-based guidance during video evaluation.

**Acceptance Criteria:**
- [ ] Inworld client setup
- [ ] Basic character interaction
- [ ] Context-aware responses
- [ ] Integration with feedback system

---

## Phase 5: Admin & Tester Panel Issues

**Note**: These issues are for future phases and not part of MVP.

### Epic: Admin Panel
**Labels**: `phase-5`, `admin-panel`, `epic`

#### Issue #21: Admin Dashboard
**Labels**: `phase-5`, `admin-panel`, `dashboard`
**Priority**: Future

**Description:**
Create comprehensive admin dashboard for user and content management.

---

### Epic: Tester Panel
**Labels**: `phase-5`, `tester-panel`, `epic`

#### Issue #22: Video Upload Interface
**Labels**: `phase-5`, `tester-panel`, `upload`
**Priority**: Future

**Description:**
Create interface for clients to upload and manage test videos.

---

## Issue Labels Reference

### Priority Labels
- `critical` - Must be done immediately
- `high` - Important for current phase
- `medium` - Nice to have in current phase
- `low` - Can be deferred

### Phase Labels
- `phase-1` - MVP functionality
- `phase-2` - Enhanced UX
- `phase-3` - AI Integration
- `phase-4` - Advanced Features
- `phase-5` - Admin/Tester Panels
- `phase-6` - Production/Scaling

### Component Labels
- `backend` - Server-side development
- `frontend` - Client-side development
- `database` - Database-related
- `authentication` - Auth system
- `video-feed` - Video functionality
- `interactions` - User interactions
- `feedback` - Feedback system
- `testing` - Quality assurance
- `documentation` - Docs and guides
- `deployment` - DevOps and deployment

### Type Labels
- `epic` - Large feature collections
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `question` - Further information needed 