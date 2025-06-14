'use client'

import { useState, useEffect } from 'react'
import { SwipeVideoPlayer } from './SwipeVideoPlayer'

interface Video {
  id: string
  title: string
  description: string
  url: string
  duration: number
  tags: string[]
  thumbnail?: string
}

interface VideoFeedProps {
  onVideoWatched: (videoId: string) => void
}

export function VideoFeed({ onVideoWatched }: VideoFeedProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Mock video data for MVP
  const mockVideos: Video[] = [
    {
      id: 'video-1',
      title: 'Product Demo Video',
      description: 'A demonstration of our latest product features',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: 596,
      tags: ['demo', 'product'],
      thumbnail: 'https://via.placeholder.com/640x360/6366f1/ffffff?text=Video+1'
    },
    {
      id: 'video-2',
      title: 'Tutorial: Getting Started',
      description: 'Learn the basics with this comprehensive tutorial',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      duration: 653,
      tags: ['tutorial', 'beginners'],
      thumbnail: 'https://via.placeholder.com/640x360/8b5cf6/ffffff?text=Video+2'
    },
    {
      id: 'video-3',
      title: 'Advanced Features Overview',
      description: 'Explore advanced features and capabilities',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration: 15,
      tags: ['advanced', 'features'],
      thumbnail: 'https://via.placeholder.com/640x360/ec4899/ffffff?text=Video+3'
    },
    {
      id: 'video-4',
      title: 'Customer Success Story',
      description: 'See how our customers achieve success',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration: 15,
      tags: ['customer', 'success'],
      thumbnail: 'https://via.placeholder.com/640x360/f59e0b/ffffff?text=Video+4'
    },
    {
      id: 'video-5',
      title: 'Behind the Scenes',
      description: 'A look behind the scenes of our development process',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      duration: 15,
      tags: ['behind-scenes', 'development'],
      thumbnail: 'https://via.placeholder.com/640x360/10b981/ffffff?text=Video+5'
    }
  ]

  useEffect(() => {
    // Simulate API call to fetch videos
    const fetchVideos = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API call
        const response = await fetch('http://localhost:3001/api/videos/feed')
        
        if (response.ok) {
          const data = await response.json()
          setVideos(data.videos || mockVideos)
        } else {
          // Use mock data for MVP
          setVideos(mockVideos)
        }
      } catch (err) {
        // Use mock data for MVP
        setVideos(mockVideos)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideos()
  }, [])

  const handleVideoReaction = async (videoId: string, reaction: 'like' | 'dislike' | 'emoji', data?: any) => {
    try {
      // Send reaction to backend
      await fetch(`http://localhost:3001/api/interactions/${videoId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reaction,
          data,
          timestamp: new Date().toISOString()
        }),
      })
      
      // Track that user watched/interacted with video
      onVideoWatched(videoId)
      
      console.log(`Video ${videoId} reaction:`, { reaction, data })
    } catch (error) {
      // For MVP, still track the video as watched
      onVideoWatched(videoId)
      console.log('Reaction saved locally (MVP mode):', { videoId, reaction, data })
    }
  }

  const handleNextVideo = () => {
    // This is called when user reaches the end of videos
    console.log('All videos completed!')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading videos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-red-300 max-w-md">
          <h3 className="font-medium mb-2">Error loading videos</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <h3 className="text-xl font-medium mb-2">No videos available</h3>
          <p className="text-gray-400">Check back later for new content!</p>
        </div>
      </div>
    )
  }

  return (
    <SwipeVideoPlayer
      videos={videos}
      onVideoReaction={handleVideoReaction}
      onNextVideo={handleNextVideo}
    />
  )
} 