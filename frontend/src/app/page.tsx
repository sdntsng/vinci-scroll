'use client'

import { useState, useEffect } from 'react'
import { VideoFeed } from '@/components/VideoFeed'
import { LoginForm } from '@/components/LoginForm'
import { Header } from '@/components/Header'
import { FeedbackModal } from '@/components/FeedbackModal'

interface User {
  id: string
  email: string
  name?: string
  token: string
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackVideo, setFeedbackVideo] = useState<string | null>(null)
  const [videosWatched, setVideosWatched] = useState(0)

  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // TODO: Validate token with backend
      setIsAuthenticated(true)
    }
  }, [])

  // Handle feedback requirement (every 5 videos)
  useEffect(() => {
    if (videosWatched > 0 && videosWatched % 5 === 0) {
      setShowFeedback(true)
    }
  }, [videosWatched])

  const handleLogin = (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('token', userData.token)
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    setVideosWatched(0)
  }

  const handleVideoWatched = (videoId: string) => {
    setVideosWatched(prev => prev + 1)
    
    // Set the video for feedback if this is the 5th video
    if ((videosWatched + 1) % 5 === 0) {
      setFeedbackVideo(videoId)
    }
  }

  const handleFeedbackSubmit = (feedbackData: any) => {
    // TODO: Submit feedback to backend
    console.log('Feedback submitted:', feedbackData)
    setShowFeedback(false)
    setFeedbackVideo(null)
  }

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">
      {!isAuthenticated ? (
        <>
          {/* Mobile-first login screen */}
          <Header 
            user={user} 
            onLogout={handleLogout}
            videosWatched={videosWatched}
          />
          <div className="flex items-center justify-center h-full px-4">
            <div className="w-full max-w-sm">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  ScrollNet
                </h1>
                <p className="text-gray-400 text-sm">
                  Swipe through videos • React with emotions • Share feedback
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  <p>📱 Mobile-optimized • 👆 Swipe to interact • 😊 Emoji reactions</p>
                </div>
              </div>
              <LoginForm onLogin={handleLogin} />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Full-screen mobile video experience */}
          <VideoFeed onVideoWatched={handleVideoWatched} />
          
          {/* Floating stats overlay */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2 text-white text-sm">
              <div className="flex items-center space-x-4">
                <span className="font-medium">{videosWatched}</span>
                <div className="w-16 bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(videosWatched % 5) * 20}%` }}
                  />
                </div>
                <span className="text-xs text-gray-300">
                  {5 - (videosWatched % 5)} to feedback
                </span>
              </div>
            </div>
          </div>

          {/* User menu button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleLogout}
              className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          videoId={feedbackVideo}
          onSubmit={handleFeedbackSubmit}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  )
}
