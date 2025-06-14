'use client'

import { useState, useEffect } from 'react'
import { SwipeVideoPlayer } from './SwipeVideoPlayer'
import { API_URLS, buildApiUrl } from '../config/api'
import { useAuth } from '../contexts/AuthContext'

interface Video {
  id: string
  title: string
  description: string
  url: string
  duration: number
  tags: string[]
  thumbnail?: string
  uploader?: string
  createdAt?: string
}

interface VideoFeedProps {
  onVideoWatched: (videoId: string) => void
}

export function VideoFeed({ onVideoWatched }: VideoFeedProps) {
  const { user, loading: authLoading } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch(`${API_URLS.VIDEOS}?limit=20`)
      const data = await response.json()
      
      if (data.success) {
        setVideos(data.videos)
        
        if (data.fallback) {
          console.log('Using fallback data:', data.message)
        }
      } else {
        throw new Error(data.message || 'Failed to fetch videos')
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
      setError('Failed to load videos. Please try again.')
      
      // Fallback to local mock data if API fails
      const fallbackVideos: Video[] = [
        {
          id: 'fallback-1',
          title: 'Welcome to ScrollNet',
          description: 'Get started with our mobile-first video platform',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: 596,
          tags: ['welcome', 'intro'],
          uploader: 'ScrollNet Team'
        },
        {
          id: 'fallback-2',
          title: 'Swipe Tutorial',
          description: 'Learn how to navigate with swipe gestures',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          duration: 653,
          tags: ['tutorial', 'gestures'],
          uploader: 'Tutorial Team'
        }
      ]
      setVideos(fallbackVideos)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVideoReaction = async (videoId: string, reaction: 'like' | 'dislike' | 'emoji', data?: any) => {
    try {
      // Use authenticated user ID or anonymous
      const userId = user?.id || 'anonymous-user'
      
      const response = await fetch(API_URLS.INTERACTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          videoId,
          type: reaction,
          data: data || {}
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('Reaction recorded:', reaction, data)
      } else {
        console.warn('Failed to record reaction:', result.message)
      }
    } catch (error) {
      console.error('Error recording reaction:', error)
      // Don't show error to user for interactions - fail silently
    }
  }

  const handleNextVideo = () => {
    // This will be handled by the SwipeVideoPlayer internally
    // We could add analytics here if needed
    console.log('Next video requested')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading videos...</p>
        </div>
      </div>
    )
  }

  if (error && videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center px-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={fetchVideos}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black">
      {error && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm">
          ⚠️ Using offline mode - {error}
        </div>
      )}
      
      <SwipeVideoPlayer
        videos={videos}
        onVideoReaction={handleVideoReaction}
        onNextVideo={handleNextVideo}
      />
    </div>
  )
} 