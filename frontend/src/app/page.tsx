'use client'

import { useState, useEffect } from 'react'
import { VideoFeed } from '@/components/VideoFeed'
import { AuthModal } from '@/components/AuthModal'
import { FeedbackModal } from '@/components/FeedbackModal'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackVideo, setFeedbackVideo] = useState<string | null>(null)
  const [videosWatched, setVideosWatched] = useState(0)

  // Handle feedback requirement (every 10 videos)
  useEffect(() => {
    if (videosWatched > 0 && videosWatched % 10 === 0) {
      setShowFeedback(true)
    }
  }, [videosWatched])

  // Show auth modal after a few videos for better engagement
  useEffect(() => {
    if (!user && videosWatched >= 3) {
      setShowAuthModal(true)
    }
  }, [user, videosWatched])

  const handleVideoWatched = (videoId: string) => {
    setVideosWatched(prev => prev + 1)
    
    // Set the video for feedback if this is the 10th video
    if ((videosWatched + 1) % 10 === 0) {
      setFeedbackVideo(videoId)
    }
  }

  const handleFeedbackSubmit = (feedbackData: any) => {
    console.log('Feedback submitted:', feedbackData)
    setShowFeedback(false)
    setFeedbackVideo(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading ScrollNet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      {/* Full-screen mobile video experience */}
      <VideoFeed onVideoWatched={handleVideoWatched} />
      
      {/* Welcome overlay for new users */}
      {!user && videosWatched === 0 && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              ScrollNet
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              Swipe through videos, react with emojis, and discover amazing content
            </p>
            <div className="space-y-3 text-sm text-gray-400 mb-8">
              <p>👆 Swipe left to dislike, right to like</p>
              <p>😊 Tap emojis on the right to react</p>
              <p>⬆️ Swipe up for next video</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-full font-medium transition-colors"
              >
                Sign Up to Save Reactions
              </button>
              <button
                onClick={() => setVideosWatched(1)}
                className="w-full bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 py-3 px-6 rounded-full font-medium transition-colors"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress indicator for authenticated users */}
      {user && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="flex items-center space-x-3 text-white text-sm">
              <span className="font-medium">{videosWatched} videos</span>
              <div className="w-20 bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(videosWatched % 10) * 10}%` }}
                />
              </div>
              <span className="text-xs text-gray-300">
                {10 - (videosWatched % 10)} to feedback
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

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
