'use client'

import { useState, useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCards, Keyboard } from 'swiper/modules'
import { useAuth } from '../contexts/AuthContext'
import 'swiper/css'
import 'swiper/css/effect-cards'

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

interface SwipeVideoPlayerProps {
  videos: Video[]
  onVideoReaction: (videoId: string, reaction: 'like' | 'dislike' | 'emoji', data?: any) => void
  onNextVideo: () => void
}

const EMOJI_REACTIONS = [
  { emoji: '❤️', label: 'Love', key: 'love' },
  { emoji: '😂', label: 'Funny', key: 'funny' },
  { emoji: '😍', label: 'Amazing', key: 'amazing' },
  { emoji: '🤔', label: 'Thinking', key: 'thinking' },
  { emoji: '🔥', label: 'Fire', key: 'fire' },
  { emoji: '👏', label: 'Applause', key: 'applause' },
  { emoji: '😮', label: 'Wow', key: 'wow' },
  { emoji: '💯', label: 'Perfect', key: 'perfect' }
]

export function SwipeVideoPlayer({ videos, onVideoReaction, onNextVideo }: SwipeVideoPlayerProps) {
  const { user, signOut } = useAuth()
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [reactionFeedback, setReactionFeedback] = useState<string | null>(null)
  const [userReactions, setUserReactions] = useState<Record<string, number>>({})
  const [showProfile, setShowProfile] = useState(false)
  
  const swiperRef = useRef<any>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

  const currentVideo = videos[currentVideoIndex]

  useEffect(() => {
    // Auto-play current video when it changes
    const currentVideoEl = videoRefs.current[currentVideo?.id]
    if (currentVideoEl && isPlaying) {
      currentVideoEl.play().catch(console.error)
    }
  }, [currentVideo, isPlaying])

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!currentVideo) return

    switch (direction) {
      case 'left':
        // Dislike
        onVideoReaction(currentVideo.id, 'dislike')
        setReactionFeedback('👎 Disliked')
        setTimeout(() => goToNextVideo(), 300)
        break
      case 'right':
        // Like
        onVideoReaction(currentVideo.id, 'like')
        setReactionFeedback('👍 Liked')
        setTimeout(() => goToNextVideo(), 300)
        break
      case 'up':
        // Next video
        goToNextVideo()
        break
    }
    
    setTimeout(() => setReactionFeedback(null), 1500)
  }

  const goToNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1)
      swiperRef.current?.slideNext()
    } else {
      onNextVideo()
    }
  }

  const togglePlay = () => {
    const videoEl = videoRefs.current[currentVideo?.id]
    if (!videoEl) return

    if (isPlaying) {
      videoEl.pause()
    } else {
      videoEl.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }

  const handleEmojiReaction = (emoji: typeof EMOJI_REACTIONS[0]) => {
    if (!currentVideo) return
    
    onVideoReaction(currentVideo.id, 'emoji', { emoji: emoji.emoji, key: emoji.key, label: emoji.label })
    setReactionFeedback(`${emoji.emoji} ${emoji.label}`)
    
    // Update local reaction count
    setUserReactions(prev => ({
      ...prev,
      [emoji.key]: (prev[emoji.key] || 0) + 1
    }))
    
    setTimeout(() => setReactionFeedback(null), 2000)
  }

  const handleVideoEnd = () => {
    setTimeout(() => goToNextVideo(), 500)
  }

  if (!currentVideo) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">🎉 All caught up!</h2>
          <p className="text-gray-400 mb-6">You've watched all available videos</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full font-medium transition-colors"
          >
            Refresh Feed
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black relative overflow-hidden">
      {/* User Profile Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors"
              onClick={() => setShowProfile(!showProfile)}
            >
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold">
                  {user?.email?.[0]?.toUpperCase() || '👤'}
                </span>
              )}
            </div>
            <div className="text-white">
              <p className="font-medium text-sm">
                {user?.user_metadata?.full_name || user?.email || 'Anonymous'}
              </p>
              {Object.keys(userReactions).length > 0 && (
                <p className="text-xs text-gray-300">
                  {Object.values(userReactions).reduce((a, b) => a + b, 0)} reactions
                </p>
              )}
            </div>
          </div>
          
          <div className="text-white text-sm">
            {currentVideoIndex + 1} / {videos.length}
          </div>
        </div>

        {/* Profile Dropdown */}
        {showProfile && (
          <div className="absolute top-16 left-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
            <div className="text-white space-y-3">
              <div>
                <p className="font-medium">{user?.email || 'Anonymous User'}</p>
                <p className="text-sm text-gray-400">
                  Total reactions: {Object.values(userReactions).reduce((a, b) => a + b, 0)}
                </p>
              </div>
              
              {Object.keys(userReactions).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Your Reactions:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(userReactions).map(([key, count]) => {
                      const emoji = EMOJI_REACTIONS.find(r => r.key === key)
                      return (
                        <div key={key} className="text-center">
                          <div className="text-lg">{emoji?.emoji}</div>
                          <div className="text-xs text-gray-400">{count}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {user && (
                <button
                  onClick={() => {
                    signOut()
                    setShowProfile(false)
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Video Swiper */}
      <Swiper
        ref={swiperRef}
        effect="cards"
        grabCursor={true}
        modules={[EffectCards, Keyboard]}
        keyboard={{ enabled: true }}
        className="h-full w-full"
        onSlideChange={(swiper) => {
          setCurrentVideoIndex(swiper.activeIndex)
        }}
        onTouchEnd={(swiper, event) => {
          const touchEvent = event as TouchEvent
          if (touchEvent.changedTouches && touchEvent.changedTouches[0]) {
            const touch = touchEvent.changedTouches[0]
            const startY = (swiper as any).touchStartY || 0
            const startX = (swiper as any).touchStartX || 0
            
            const deltaY = touch.clientY - startY
            const deltaX = touch.clientX - startX
            
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
              handleSwipe(deltaX > 0 ? 'right' : 'left')
            } else if (deltaY < -100) {
              handleSwipe('up')
            }
          }
        }}
        onTouchStart={(swiper, event) => {
          const touchEvent = event as TouchEvent
          if (touchEvent.touches && touchEvent.touches[0]) {
            (swiper as any).touchStartY = touchEvent.touches[0].clientY;
            (swiper as any).touchStartX = touchEvent.touches[0].clientX
          }
        }}
      >
        {videos.map((video, index) => (
          <SwiperSlide key={video.id} className="relative">
            <div className="relative h-full w-full bg-black">
              {/* Video */}
              <video
                ref={(el) => { videoRefs.current[video.id] = el }}
                className="h-full w-full object-cover"
                src={video.url}
                poster={video.thumbnail}
                muted
                loop
                playsInline
                onEnded={handleVideoEnd}
                onLoadedData={() => {
                  if (index === currentVideoIndex && isPlaying) {
                    videoRefs.current[video.id]?.play().catch(console.error)
                  }
                }}
                onClick={togglePlay}
              />

              {/* Video Info Overlay */}
              <div className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white font-bold text-lg mb-1">{video.title}</h3>
                {video.description && (
                  <p className="text-gray-300 text-sm mb-2 line-clamp-2">{video.description}</p>
                )}
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>@{video.uploader || 'anonymous'}</span>
                  {video.tags && video.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <span>#{video.tags[0]}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Play/Pause Indicator */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 rounded-full p-4">
                    <div className="w-12 h-12 text-white flex items-center justify-center">
                      ▶️
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Emoji Reactions Panel */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40">
        <div className="flex flex-col space-y-3">
          {EMOJI_REACTIONS.map((reaction) => (
            <button
              key={reaction.key}
              onClick={() => handleEmojiReaction(reaction)}
              className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl hover:bg-black/70 transition-all duration-200 hover:scale-110 active:scale-95"
              title={reaction.label}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Swipe Instructions */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
          <p className="text-white text-xs text-center">
            ← Dislike • Like → • ↑ Next
          </p>
        </div>
      </div>

      {/* Reaction Feedback */}
      {reactionFeedback && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-black/80 backdrop-blur-sm rounded-full px-6 py-3 animate-pulse">
            <p className="text-white text-lg font-medium text-center">{reactionFeedback}</p>
          </div>
        </div>
      )}
    </div>
  )
} 