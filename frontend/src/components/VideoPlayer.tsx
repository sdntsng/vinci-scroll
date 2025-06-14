'use client'

import { useState, useRef, useEffect } from 'react'
import { buildApiUrl } from '../config/api'

interface Video {
  id: string
  title: string
  description: string
  url: string
  duration: number
  tags: string[]
  thumbnail?: string
}

interface VideoPlayerProps {
  video: Video
  onVideoEnd: () => void
}

export function VideoPlayer({ video, onVideoEnd }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasReacted, setHasReacted] = useState(false)
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onVideoEnd()
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [onVideoEnd])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = parseFloat(e.target.value)
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleReaction = async (reactionType: 'like' | 'dislike') => {
    if (hasReacted) return

    setReaction(reactionType)
    setHasReacted(true)

    // TODO: Send reaction to backend
    try {
      await fetch(buildApiUrl(`/api/interactions/${video.id}/react`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reaction: reactionType,
          timestamp: currentTime
        }),
      })
    } catch (error) {
      console.log('Reaction saved locally (MVP mode):', { reactionType, video: video.id })
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full aspect-video"
        src={video.url}
        poster={video.thumbnail}
        preload="metadata"
      />
      
      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <div className="flex-1 flex items-center space-x-2">
            <span className="text-white text-sm min-w-12">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
            <span className="text-white text-sm min-w-12">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Reactions */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={() => handleReaction('like')}
          disabled={hasReacted}
          className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-all ${
            reaction === 'like'
              ? 'bg-green-600 text-white'
              : hasReacted
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          <span>Like</span>
        </button>
        
        <button
          onClick={() => handleReaction('dislike')}
          disabled={hasReacted}
          className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-all ${
            reaction === 'dislike'
              ? 'bg-red-600 text-white'
              : hasReacted
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <svg className="w-4 h-4 rotate-180" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          <span>Dislike</span>
        </button>
      </div>

      {hasReacted && (
        <div className="absolute top-16 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm animate-fade-in">
          Reaction saved!
        </div>
      )}
    </div>
  )
} 