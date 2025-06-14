// API Configuration
// This file centralizes all API endpoint configurations to avoid hardcoded URLs

const getServerUrl = (): string => {
  // In production, use environment variable
  if (typeof window !== 'undefined') {
    // Client-side: check for environment variable or use current origin with different port
    return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
  } else {
    // Server-side: use environment variable or default
    return process.env.SERVER_URL || 'http://localhost:3001';
  }
};

export const API_CONFIG = {
  BASE_URL: getServerUrl(),
  ENDPOINTS: {
    VIDEOS: '/api/videos',
    VIDEO_FEED: '/api/videos/feed',
    INTERACTIONS: '/api/interactions',
    FEEDBACK: '/api/feedback',
    HEALTH: '/api/health',
    UPLOAD: '/api/upload'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Common API endpoints
export const API_URLS = {
  VIDEOS: buildApiUrl(API_CONFIG.ENDPOINTS.VIDEOS),
  VIDEO_FEED: buildApiUrl(API_CONFIG.ENDPOINTS.VIDEO_FEED),
  INTERACTIONS: buildApiUrl(API_CONFIG.ENDPOINTS.INTERACTIONS),
  FEEDBACK: buildApiUrl(API_CONFIG.ENDPOINTS.FEEDBACK),
  HEALTH: buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH),
  UPLOAD: buildApiUrl(API_CONFIG.ENDPOINTS.UPLOAD)
}; 