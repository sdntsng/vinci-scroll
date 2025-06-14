# ScrollNet Technical Documentation

## Project Status: Phase 1 (MVP) Development - Production-Ready Backend

**Current Focus**: Mobile-optimized video engagement with production-grade storage and database

## Architecture Overview

### Phase-Based Development Architecture

```
ScrollNet Platform
├── Phase 1: MVP (CURRENT) - Production Backend Integration
│   ├── User Authentication System (Supabase Auth)
│   ├── Video Storage & Management (Google Cloud Storage)
│   ├── Database & Analytics (Supabase PostgreSQL)
│   ├── Swipe Video Feed (Tinder-like UX)
│   │   ├── Swipe Right = Like
│   │   ├── Swipe Left = Dislike  
│   │   ├── Swipe Up = Next Video
│   │   └── Emoji Reactions (8 different emotions)
│   ├── Mobile Video Player with Full-Screen Experience
│   ├── Feedback Collection (every 5 videos)
│   ├── Real-time Interaction Tracking
│   └── Bulk Video Upload System
├── Phase 2: Enhanced UX & Analytics
├── Phase 3: AI Integration (Mistral, Inworld)
├── Phase 4: Advanced Features
├── Phase 5: Scale & Performance
└── Phase 6: Production Launch
```

## Current Technology Stack

### Backend Infrastructure
- **Runtime**: Node.js with Express.js
- **Database**: Supabase (PostgreSQL with real-time features)
- **Storage**: Google Cloud Storage (global CDN)
- **Authentication**: Supabase Auth (JWT-based)
- **File Processing**: Multer for uploads
- **Environment**: dotenv for configuration

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom mobile-first components
- **Gestures**: Swiper.js for touch interactions
- **State Management**: React hooks (useState, useEffect)

### Mobile-First Features
- **Swipe Gestures**: Tinder-like video navigation
- **Touch Optimized**: Full-screen mobile experience
- **Responsive Design**: Portrait-first with landscape support
- **Offline Fallback**: Graceful degradation when backend unavailable

## Database Schema (Supabase)

### Core Tables
```sql
-- User profiles (extends Supabase auth.users)
user_profiles (id, username, full_name, avatar_url, created_at, updated_at)

-- Videos with metadata
videos (id, title, description, gcs_url, thumbnail_url, duration, file_size, 
        mime_type, tags, metadata, uploaded_by, is_active, created_at, updated_at)

-- User interactions (likes, dislikes, emoji reactions, views)
user_interactions (id, user_id, video_id, interaction_type, interaction_data, created_at)

-- Feedback collection
feedback (id, user_id, video_id, rating, categories, would_recommend, 
          comments, improvement_suggestions, created_at)

-- Upload session tracking
upload_sessions (id, user_id, session_name, total_files, uploaded_files, 
                failed_files, status, created_at, completed_at)
```

### Security Features
- **Row Level Security (RLS)**: Enabled on all tables
- **JWT Authentication**: Supabase handles token validation
- **API Key Management**: Separate keys for client/server access
- **CORS Configuration**: Properly configured for frontend access

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login (MVP: mock auth)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Video Management
- `GET /api/videos` - Get video feed with pagination
- `GET /api/videos/:videoId` - Get specific video details
- `PUT /api/videos/:videoId` - Update video metadata
- `DELETE /api/videos/:videoId` - Soft delete video

### Video Upload
- `POST /api/upload/video` - Upload single video
- `POST /api/upload/batch` - Upload multiple videos
- `POST /api/upload/directory` - Upload from local directory
- `GET /api/upload/session/:sessionId` - Get upload session status
- `GET /api/upload/videos` - List uploaded videos

### User Interactions
- `POST /api/interactions` - Record user interaction (like/dislike/emoji)
- `GET /api/interactions/:userId/:videoId` - Get user interactions for video

### Feedback & Analytics
- `POST /api/feedback` - Submit user feedback
- `GET /api/analytics/video/:videoId` - Get video analytics

### System
- `GET /api/health` - Health check and system status

## File Upload System

### Google Cloud Storage Integration
- **Bucket Configuration**: Public read access for video streaming
- **File Organization**: Videos stored in `/videos/` prefix with timestamps
- **Supported Formats**: MP4, AVI, MOV, WMV, FLV, WebM, MKV, M4V
- **File Size Limit**: 500MB per video
- **CDN**: Automatic global distribution via GCS

### Upload Methods
1. **Single Upload**: Web form or API endpoint
2. **Batch Upload**: Multiple files via API
3. **Directory Upload**: Bulk upload from local folder
4. **Script Upload**: Command-line tool for large collections

### Upload Process Flow
```
Local Video → Multer Processing → GCS Upload → Database Record → Frontend Display
```

## Mobile Swipe Interface

### Gesture Controls
- **Swipe Left**: Dislike video (red animation)
- **Swipe Right**: Like video (green animation)
- **Swipe Up**: Next video (purple animation)
- **Tap Screen**: Play/Pause video
- **Long Press**: Show emoji reaction picker

### Emoji Reactions
- ❤️ Love - Deep emotional connection
- 😂 Funny - Humorous content
- 😍 Amazing - Impressive or beautiful
- 🤔 Thinking - Thought-provoking
- 🔥 Fire - Exciting or trending
- 👏 Applause - Appreciative
- 😮 Wow - Surprising
- 💯 Perfect - Exceptional quality

### Visual Feedback
- **Swipe Indicators**: Directional arrows with color coding
- **Progress Tracking**: Videos watched counter
- **Reaction Animations**: Smooth emoji animations
- **Loading States**: Skeleton screens and spinners

## Development Workflow

### Environment Setup
1. **Google Cloud Storage**: Create project, bucket, service account
2. **Supabase**: Create project, run schema, get API keys
3. **Environment Variables**: Configure .env files
4. **Dependencies**: Install Node.js packages

### Video Upload Workflow
```bash
# 1. Start the development server
npm run dev

# 2. Upload videos using the script
node scripts/upload-videos.js /path/to/videos

# 3. Videos appear in the mobile app automatically
```

### Development Commands
```bash
# Install dependencies
npm install && cd frontend && npm install

# Start development (both backend and frontend)
npm run dev

# Backend only
npm run server

# Frontend only
npm run client

# Upload videos
node scripts/upload-videos.js /path/to/videos
```

## Performance Considerations

### Video Streaming
- **CDN Delivery**: Google Cloud Storage provides global CDN
- **Format Optimization**: Support for multiple video formats
- **Progressive Loading**: Videos load as user swipes
- **Caching Strategy**: Browser caching for repeated views

### Database Performance
- **Indexed Queries**: Optimized for video feed and interactions
- **Connection Pooling**: Supabase handles connection management
- **Real-time Updates**: WebSocket connections for live data
- **Query Optimization**: Efficient joins and filtering

### Mobile Performance
- **Touch Response**: <100ms gesture recognition
- **Memory Management**: Video cleanup on swipe
- **Network Efficiency**: Lazy loading and prefetching
- **Battery Optimization**: Efficient video playback

## Security & Privacy

### Data Protection
- **Environment Variables**: All secrets in .env files
- **Service Account Keys**: Secure JSON key management
- **API Authentication**: JWT tokens for user sessions
- **HTTPS Only**: Secure connections in production

### User Privacy
- **Anonymous Mode**: Support for anonymous interactions
- **Data Retention**: Configurable retention policies
- **GDPR Compliance**: User data export/deletion capabilities
- **Audit Logging**: Track data access and modifications

## Monitoring & Analytics

### System Monitoring
- **Health Checks**: Automated endpoint monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time and throughput
- **Resource Usage**: Storage and database utilization

### User Analytics
- **Interaction Tracking**: Swipe patterns and preferences
- **Video Performance**: View duration and engagement
- **User Journey**: Navigation patterns and drop-off points
- **Feedback Analysis**: Rating trends and sentiment

## Deployment Strategy

### Current (Development)
- **Local Development**: localhost with hot reload
- **Mock Data Fallback**: Graceful degradation
- **Environment Isolation**: Separate dev/prod configs

### Production Ready
- **Container Deployment**: Docker support
- **Environment Variables**: Production configuration
- **Database Migrations**: Automated schema updates
- **CDN Configuration**: Optimized content delivery

## Next Phase Planning

### Phase 2: Enhanced UX & Analytics
- Real-time user authentication
- Advanced video analytics
- Personalized recommendations
- Social features (sharing, comments)

### Phase 3: AI Integration
- Mistral AI for content analysis
- Inworld AI for interactive experiences
- Automated video tagging
- Intelligent content curation

## File Structure
```
scrollnet/
├── src/                     # Backend source
│   ├── services/           # GCS and Supabase services
│   ├── routes/             # API route handlers
│   └── index.js            # Main server file
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   └── components/    # React components
│   └── package.json
├── database/              # Database schemas
├── scripts/               # Utility scripts
├── SETUP_GUIDE.md        # Comprehensive setup guide
└── package.json          # Backend dependencies
```

This architecture provides a solid foundation for the MVP while being scalable for future phases. 