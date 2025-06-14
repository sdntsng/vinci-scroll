# ScrollNet Technical Documentation

## 🏗️ Architecture Overview

ScrollNet is a full-stack web application built with a mobile-first approach, featuring a React/Next.js frontend and Node.js/Express backend, with Supabase as the database and Google Cloud Storage for video files.

### **System Architecture**
```
ScrollNet
├── Frontend
│   ├── Next.js 14
│   ├── TypeScript
│   ├── Tailwind CSS
│   ├── Swiper.js
│   ├── React Context API
│   └── Supabase Auth
├── Backend
│   ├── Node.js + Express.js
│   ├── Supabase (PostgreSQL)
│   ├── Google Cloud Storage
│   ├── JWT tokens
│   └── RESTful API
└── Infrastructure
    ├── Local development servers
    ├── Supabase cloud-hosted PostgreSQL
    ├── Google Cloud Storage buckets
    └── Environment variables
```

### **Technology Stack**

#### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with mobile-first responsive design
- **UI Library**: Swiper.js for touch interactions
- **State Management**: React Context API
- **Authentication**: Supabase Auth with Google OAuth

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with middleware
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Google Cloud Storage
- **Authentication**: JWT tokens with Supabase integration
- **API Design**: RESTful endpoints with JSON responses

#### Infrastructure
- **Development**: Local development servers (ports 3001, 3004)
- **Database**: Supabase cloud-hosted PostgreSQL
- **File Storage**: Google Cloud Storage buckets
- **Environment**: Environment variables for configuration

---

## 📊 Database Schema

### **Core Tables**

#### `users` (Supabase Auth)
```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  encrypted_password VARCHAR,
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Additional Supabase auth fields
);
```

#### `user_profiles`
```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name VARCHAR(100),
  avatar_url TEXT,
  total_reactions INTEGER DEFAULT 0,
  total_videos_watched INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `videos`
```sql
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  gcs_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  file_size BIGINT,
  mime_type VARCHAR(50),
  tags TEXT[], -- PostgreSQL array
  uploaded_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `user_interactions`
```sql
CREATE TABLE public.user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- Can be null for anonymous users
  session_id UUID, -- For anonymous user tracking
  video_id UUID REFERENCES videos(id) NOT NULL,
  interaction_type VARCHAR(50) NOT NULL, -- 'like', 'dislike', 'emoji', 'view'
  interaction_data JSONB, -- Flexible data storage
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `feedback`
```sql
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- Can be null for anonymous users
  session_id UUID, -- For anonymous user tracking
  video_id UUID REFERENCES videos(id) NOT NULL,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  content_quality INTEGER CHECK (content_quality >= 1 AND content_quality <= 5),
  engagement_level INTEGER CHECK (engagement_level >= 1 AND engagement_level <= 5),
  relevance INTEGER CHECK (relevance >= 1 AND relevance <= 5),
  technical_quality INTEGER CHECK (technical_quality >= 1 AND technical_quality <= 5),
  comments TEXT,
  suggestions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Indexes for Performance**
```sql
-- Video queries
CREATE INDEX idx_videos_active_created ON videos(is_active, created_at DESC);
CREATE INDEX idx_videos_uploaded_by ON videos(uploaded_by);

-- Interaction queries
CREATE INDEX idx_interactions_video_type ON user_interactions(video_id, interaction_type);
CREATE INDEX idx_interactions_user_created ON user_interactions(user_id, created_at DESC);
CREATE INDEX idx_interactions_session_created ON user_interactions(session_id, created_at DESC);

-- Feedback queries
CREATE INDEX idx_feedback_video ON feedback(video_id);
CREATE INDEX idx_feedback_user_created ON feedback(user_id, created_at DESC);
```

---

## 🔌 API Reference

### **Base URL**
- Development: `http://localhost:3001`
- Production: `https://your-domain.com`

### **Authentication**
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### **Video Endpoints**

#### `GET /api/videos`
Get paginated video feed

**Query Parameters:**
- `limit` (optional): Number of videos to return (default: 10, max: 50)
- `offset` (optional): Number of videos to skip (default: 0)
- `userId` (optional): User ID for personalization

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "uuid",
      "title": "Video Title",
      "description": "Video description",
      "gcs_url": "https://storage.googleapis.com/...",
      "thumbnail_url": "https://storage.googleapis.com/...",
      "duration": 120,
      "tags": ["tag1", "tag2"],
      "uploaded_by": "uuid",
      "created_at": "2025-06-14T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### `GET /api/videos/:id`
Get specific video details

**Response:**
```json
{
  "success": true,
  "video": {
    "id": "uuid",
    "title": "Video Title",
    "description": "Video description",
    "gcs_url": "https://storage.googleapis.com/...",
    "thumbnail_url": "https://storage.googleapis.com/...",
    "duration": 120,
    "file_size": 15728640,
    "mime_type": "video/mp4",
    "tags": ["tag1", "tag2"],
    "uploaded_by": "uuid",
    "created_at": "2025-06-14T10:00:00Z",
    "stats": {
      "total_views": 150,
      "total_likes": 45,
      "total_reactions": 67
    }
  }
}
```

#### `POST /api/videos/upload`
Upload a new video (multipart/form-data)

**Form Data:**
- `video`: Video file (required)
- `title`: Video title (required)
- `description`: Video description (optional)
- `tags`: Comma-separated tags (optional)

**Response:**
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "video": {
    "id": "uuid",
    "title": "Uploaded Video",
    "gcs_url": "https://storage.googleapis.com/...",
    "created_at": "2025-06-14T10:00:00Z"
  }
}
```

### **Interaction Endpoints**

#### `POST /api/interactions`
Record user interaction with a video

**Request Body:**
```json
{
  "userId": "uuid", // Optional for anonymous users
  "videoId": "uuid",
  "type": "like|dislike|emoji|view",
  "data": {
    "emoji": "❤️", // For emoji interactions
    "timestamp": 1234567890 // For view interactions
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interaction recorded",
  "interaction": {
    "id": "uuid",
    "user_id": "uuid",
    "video_id": "uuid",
    "interaction_type": "emoji",
    "interaction_data": {"emoji": "❤️"},
    "created_at": "2025-06-14T10:00:00Z"
  }
}
```

#### `GET /api/interactions/stats`
Get user interaction statistics

**Query Parameters:**
- `userId` (optional): User ID for authenticated users
- `sessionId` (optional): Session ID for anonymous users

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_interactions": 150,
    "total_likes": 45,
    "total_dislikes": 12,
    "total_emoji_reactions": 67,
    "total_videos_watched": 89,
    "favorite_emoji": "❤️",
    "engagement_score": 0.85
  }
}
```

### **Feedback Endpoints**

#### `POST /api/feedback`
Submit detailed feedback for a video

**Request Body:**
```json
{
  "userId": "uuid", // Optional for anonymous users
  "videoId": "uuid",
  "overallRating": 4,
  "contentQuality": 5,
  "engagementLevel": 4,
  "relevance": 3,
  "technicalQuality": 4,
  "comments": "Great video content!",
  "suggestions": "Could improve audio quality"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "feedback": {
    "id": "uuid",
    "video_id": "uuid",
    "overall_rating": 4,
    "created_at": "2025-06-14T10:00:00Z"
  }
}
```

#### `GET /api/feedback/required`
Check if feedback is required for user

**Query Parameters:**
- `userId` (optional): User ID for authenticated users
- `sessionId` (optional): Session ID for anonymous users

**Response:**
```json
{
  "success": true,
  "feedbackRequired": true,
  "videosWatched": 5,
  "nextFeedbackAt": 10
}
```

### **Authentication Endpoints**

#### `POST /auth/login`
User login with email/password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "User Name"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1234567890
  }
}
```

#### `POST /auth/register`
User registration

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "User Name"
}
```

#### `GET /auth/me`
Get current user profile (requires authentication)

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "User Name",
    "avatar_url": "https://...",
    "total_reactions": 150,
    "total_videos_watched": 89,
    "created_at": "2025-06-01T10:00:00Z"
  }
}
```

### **Health Check**

#### `GET /api/health`
System health check

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-06-14T10:00:00Z",
  "services": {
    "database": "connected",
    "storage": "connected"
  }
}
```

---

## 🎨 Frontend Components

### **Component Architecture**

```
src/
├── app/
│   ├── page.tsx                 # Main application page
│   ├── layout.tsx              # Root layout with providers
│   └── auth/
│       └── callback/
│           └── page.tsx        # OAuth callback handler
├── components/
│   ├── SwipeVideoPlayer.tsx    # Core swipe interface
│   ├── VideoFeed.tsx          # Video feed management
│   ├── AuthModal.tsx          # Authentication modal
│   ├── FeedbackModal.tsx      # Feedback collection
│   └── LoginForm.tsx          # Login form component
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── config/
│   └── api.ts                 # API configuration
└── lib/
    └── supabase.ts           # Supabase client setup
```

### **Key Components**

#### `SwipeVideoPlayer.tsx`
The core component handling video playback and swipe interactions.

**Props:**
```typescript
interface SwipeVideoPlayerProps {
  videos: Video[]
  onVideoChange: (index: number) => void
  onInteraction: (videoId: string, type: string, data?: any) => void
  onFeedbackRequired: () => void
}
```

**Features:**
- Touch gesture recognition (swipe left/right/up)
- Video playback controls (play/pause on tap)
- Emoji reaction panel
- Progress tracking
- User profile display

#### `AuthContext.tsx`
React context providing authentication state and methods.

**Context Value:**
```typescript
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error: any }>
}
```

#### `VideoFeed.tsx`
Manages video data fetching and state management.

**Features:**
- Infinite scroll/pagination
- Video preloading
- Error handling and retries
- Loading states

### **Mobile Optimizations**

#### Touch Interactions
```typescript
// Swipe gesture detection
const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

const handleTouchEnd = (e: TouchEvent) => {
  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY
  
  const deltaX = touchEndX - touchStartX
  const deltaY = touchEndY - touchStartY
  
  // Determine swipe direction
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 50) handleSwipeRight()
    else if (deltaX < -50) handleSwipeLeft()
  } else if (deltaY < -50) {
    handleSwipeUp()
  }
}
```

#### Performance Optimizations
```typescript
// Video preloading
const preloadNextVideo = useCallback((index: number) => {
  if (videos[index + 1]) {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = videos[index + 1].gcs_url
  }
}, [videos])

// Memory cleanup
useEffect(() => {
  return () => {
    // Cleanup video references
    videoRefs.current.forEach(ref => {
      if (ref) {
        ref.pause()
        ref.src = ''
        ref.load()
      }
    })
  }
}, [])
```

---

## 🔧 Backend Implementation

### **Server Setup**
```javascript
// src/index.js
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { createClient } = require('@supabase/supabase-js')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3004',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

### **Authentication Middleware**
```javascript
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' })
  }
}
```

### **Video Upload Handler**
```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true)
    } else {
      cb(new Error('Only video files are allowed'))
    }
  }
})

app.post('/api/videos/upload', upload.single('video'), async (req, res) => {
  try {
    const { title, description, tags } = req.body
    const file = req.file
    
    if (!file) {
      return res.status(400).json({ error: 'No video file provided' })
    }
    
    // Upload to Google Cloud Storage
    const fileName = `videos/${Date.now()}-${file.originalname}`
    const gcsUrl = await uploadToGCS(file.buffer, fileName, file.mimetype)
    
    // Save to database
    const { data: video, error } = await supabase
      .from('videos')
      .insert({
        title,
        description,
        gcs_url: gcsUrl,
        file_size: file.size,
        mime_type: file.mimetype,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        uploaded_by: req.user?.id
      })
      .select()
      .single()
    
    if (error) throw error
    
    res.json({
      success: true,
      message: 'Video uploaded successfully',
      video
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### **Google Cloud Storage Integration**
```javascript
const { Storage } = require('@google-cloud/storage')

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
})

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME)

const uploadToGCS = async (buffer, fileName, mimeType) => {
  const file = bucket.file(fileName)
  
  const stream = file.createWriteStream({
    metadata: {
      contentType: mimeType,
    },
    public: true,
  })
  
  return new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.on('finish', () => {
      resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`)
    })
    stream.end(buffer)
  })
}
```

---

## 🔒 Security Implementation

### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_CLOUD_PROJECT_ID=your_gcp_project
GOOGLE_CLOUD_KEY_FILE=path/to/service-account.json
GCS_BUCKET_NAME=your_bucket_name
SERVER_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3004
FRONTEND_PORT=3004
```

### **Input Validation**
```javascript
const { body, validationResult } = require('express-validator')

const validateFeedback = [
  body('videoId').isUUID().withMessage('Invalid video ID'),
  body('overallRating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('contentQuality').isInt({ min: 1, max: 5 }).withMessage('Content quality must be 1-5'),
  body('comments').optional().isLength({ max: 1000 }).withMessage('Comments too long'),
  
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]
```

### **Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit')

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 uploads per hour
  message: 'Upload limit exceeded'
})

app.use('/api/', apiLimiter)
app.use('/api/videos/upload', uploadLimiter)
```

---

## 📱 Mobile Performance

### **Optimization Strategies**

#### Bundle Splitting
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    }
    return config
  },
}
```

#### Image and Video Optimization
```typescript
// Video preloading strategy
const VideoPreloader = ({ src, onLoad }: { src: string, onLoad: () => void }) => {
  useEffect(() => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = onLoad
    video.src = src
  }, [src, onLoad])
  
  return null
}
```

#### Memory Management
```typescript
// Cleanup video references
const useVideoCleanup = (videoRefs: RefObject<HTMLVideoElement>[]) => {
  useEffect(() => {
    return () => {
      videoRefs.forEach(ref => {
        if (ref.current) {
          ref.current.pause()
          ref.current.removeAttribute('src')
          ref.current.load()
        }
      })
    }
  }, [videoRefs])
}
```

### **Performance Metrics**

#### Core Web Vitals Targets
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

#### Mobile-Specific Metrics
- **Touch Response Time**: < 100ms
- **Gesture Recognition Accuracy**: > 95%
- **Video Load Time**: < 3s
- **Memory Usage**: < 50MB on mobile devices

---

## 🧪 Testing Strategy

### **Unit Testing**
```javascript
// __tests__/api/videos.test.js
const request = require('supertest')
const app = require('../../src/index')

describe('Video API', () => {
  test('GET /api/videos returns video list', async () => {
    const response = await request(app)
      .get('/api/videos')
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.videos)).toBe(true)
  })
  
  test('POST /api/interactions records interaction', async () => {
    const interaction = {
      videoId: 'test-uuid',
      type: 'like',
      data: {}
    }
    
    const response = await request(app)
      .post('/api/interactions')
      .send(interaction)
      .expect(200)
    
    expect(response.body.success).toBe(true)
  })
})
```

### **Component Testing**
```typescript
// __tests__/components/SwipeVideoPlayer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import SwipeVideoPlayer from '../src/components/SwipeVideoPlayer'

const mockVideos = [
  { id: '1', title: 'Test Video', gcs_url: 'test.mp4' }
]

test('renders video player with controls', () => {
  render(
    <SwipeVideoPlayer 
      videos={mockVideos}
      onVideoChange={jest.fn()}
      onInteraction={jest.fn()}
      onFeedbackRequired={jest.fn()}
    />
  )
  
  expect(screen.getByRole('video')).toBeInTheDocument()
  expect(screen.getByText('Test Video')).toBeInTheDocument()
})

test('handles swipe gestures', () => {
  const onInteraction = jest.fn()
  
  render(
    <SwipeVideoPlayer 
      videos={mockVideos}
      onVideoChange={jest.fn()}
      onInteraction={onInteraction}
      onFeedbackRequired={jest.fn()}
    />
  )
  
  const player = screen.getByTestId('video-player')
  
  // Simulate swipe right
  fireEvent.touchStart(player, { touches: [{ clientX: 0, clientY: 0 }] })
  fireEvent.touchEnd(player, { changedTouches: [{ clientX: 100, clientY: 0 }] })
  
  expect(onInteraction).toHaveBeenCalledWith('1', 'like')
})
```

### **E2E Testing**
```typescript
// cypress/e2e/video-feed.cy.ts
describe('Video Feed', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3004')
  })
  
  it('loads video feed and allows swiping', () => {
    cy.get('[data-testid="video-player"]').should('be.visible')
    cy.get('video').should('have.attr', 'src')
    
    // Test swipe interaction
    cy.get('[data-testid="video-player"]')
      .trigger('touchstart', { touches: [{ clientX: 0, clientY: 0 }] })
      .trigger('touchend', { changedTouches: [{ clientX: 100, clientY: 0 }] })
    
    cy.get('[data-testid="like-feedback"]').should('be.visible')
  })
  
  it('shows feedback modal after 5 videos', () => {
    // Simulate watching 5 videos
    for (let i = 0; i < 5; i++) {
      cy.get('[data-testid="video-player"]')
        .trigger('touchstart', { touches: [{ clientX: 0, clientY: 0 }] })
        .trigger('touchend', { changedTouches: [{ clientX: 0, clientY: -100 }] })
      cy.wait(1000)
    }
    
    cy.get('[data-testid="feedback-modal"]').should('be.visible')
  })
})
```

---

## 🚀 Deployment

### **Development Setup**
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development servers
npm run dev

# Frontend: http://localhost:3004
# Backend: http://localhost:3001
```

### **Production Build**
```bash
# Build frontend
cd frontend && npm run build

# Start production servers
npm run start:prod
```

### **Docker Configuration**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd frontend && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Expose ports
EXPOSE 3001 3004

# Start application
CMD ["npm", "run", "start:prod"]
```

### **Environment Configuration**
```yaml
# docker-compose.yml
version: '3.8'
services:
  scrollnet:
    build: .
    ports:
      - "3001:3001"
      - "3004:3004"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - GOOGLE_CLOUD_PROJECT_ID=${GOOGLE_CLOUD_PROJECT_ID}
    volumes:
      - ./uploads:/app/uploads
```

---

## 📊 Monitoring & Analytics

### **Performance Monitoring**
```javascript
// Performance tracking
const trackPerformance = (metric, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: metric,
      value: Math.round(value)
    })
  }
}

// Track video load times
const trackVideoLoad = (startTime) => {
  const loadTime = performance.now() - startTime
  trackPerformance('video_load_time', loadTime)
}
```

### **Error Tracking**
```javascript
// Error boundary for React components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error tracking service
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error)
    }
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>
    }
    
    return this.props.children
  }
}
```

### **User Analytics**
```typescript
// Track user interactions
const trackUserInteraction = (action: string, properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track(action, {
      ...properties,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`
    })
  }
}

// Usage examples
trackUserInteraction('video_swiped', { 
  video_id: videoId, 
  direction: 'right',
  interaction_type: 'like'
})

trackUserInteraction('feedback_submitted', {
  video_id: videoId,
  overall_rating: rating,
  feedback_length: comments.length
})
```

---

## 🔄 Future Enhancements

### **Phase 2: Enhanced UX**
- Advanced video player controls (speed, quality selection)
- User analytics dashboard with engagement metrics
- Gamification elements (points, badges, leaderboards)
- Enhanced feedback collection with contextual prompts

### **Phase 3: AI Integration**
- Inworld AI character for user guidance and support
- Mistral AI for content analysis and recommendations
- Conversational feedback collection system
- Personalized video recommendations

### **Phase 4: Advanced Features**
- Reinforcement learning engine for optimization
- Social features and content sharing
- Advanced analytics and insights
- Competition and challenge systems

---

*This technical documentation is maintained alongside code changes and updated with each release.*  
*Last Updated: June 14, 2025*