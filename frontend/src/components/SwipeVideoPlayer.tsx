'use client'

import { useState, useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, EffectCards } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-cards'

interface Video {
  id: string
  title: string
  description: string
  url: string
  duration: number
  tags: string[]
  thumbnail?: string
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
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showEmojiBar, setShowEmojiBar] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null)
  const [reactionFeedback, setReactionFeedback] = useState<string | null>(null)
  
  const swiperRef = useRef<any>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

  const currentVideo = videos[currentVideoIndex]

  useEffect(() => {
    // Auto-play current video when it changes
    const currentVideoEl = videoRefs.current[currentVideo?.id]
    if (currentVideoEl && isPlaying) {
      currentVideoEl.play()
    }
  }, [currentVideo, isPlaying])

  const handleSwipeStart = () => {
    setSwipeDirection(null)
    setReactionFeedback(null)
  }

  const handleSwipeMove = (direction: 'left' | 'right' | 'up') => {
    setSwipeDirection(direction)
  }

  const handleSwipeEnd = (direction: 'left' | 'right' | 'up') => {
    if (!currentVideo) return

    switch (direction) {
      case 'left':
        // Dislike
        onVideoReaction(currentVideo.id, 'dislike')
        setReactionFeedback('👎 Disliked')
        setTimeout(() => goToNextVideo(), 500)
        break
      case 'right':
        // Like
        onVideoReaction(currentVideo.id, 'like')
        setReactionFeedback('👍 Liked')
        setTimeout(() => goToNextVideo(), 500)
        break
      case 'up':
        // Next video
        goToNextVideo()
        break
    }
    
    setTimeout(() => {
      setSwipeDirection(null)
      setReactionFeedback(null)
    }, 1000)
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
      videoEl.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleEmojiReaction = (emoji: typeof EMOJI_REACTIONS[0]) => {
    if (!currentVideo) return
    
    onVideoReaction(currentVideo.id, 'emoji', { emoji: emoji.emoji, key: emoji.key, label: emoji.label })
    setReactionFeedback(`${emoji.emoji} ${emoji.label}`)
    setShowEmojiBar(false)
    
    setTimeout(() => setReactionFeedback(null), 2000)
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    setTimeout(() => goToNextVideo(), 1000)
  }

  if (!currentVideo) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No more videos!</h2>
          <p className="text-gray-400">Great job watching all the content!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black relative overflow-hidden">
      <Swiper
        ref={swiperRef}
        effect="cards"
        grabCursor={true}
        modules={[EffectCards, Navigation, Pagination]}
        className="h-full w-full"
        onTouchStart={() => handleSwipeStart()}
        onTouchMove={(swiper, event) => {
          const touchEvent = event as TouchEvent
          if (touchEvent.touches && touchEvent.touches[0]) {
            const touch = touchEvent.touches[0]
            const { clientX, clientY } = touch
            const { innerWidth, innerHeight } = window
            
            const deltaX = clientX - innerWidth / 2
            const deltaY = clientY - innerHeight / 2
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              handleSwipeMove(deltaX > 0 ? 'right' : 'left')
            } else if (deltaY < -50) {
              handleSwipeMove('up')
            }
          }
        }}
        onTouchEnd={() => {
          if (swipeDirection) {
            handleSwipeEnd(swipeDirection)
          }
        }}
        onSlideChange={(swiper) => {
          setCurrentVideoIndex(swiper.activeIndex)
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
                    videoRefs.current[video.id]?.play()
                  }
                }}
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

              {/* Video Info */}
              <div className="absolute bottom-20 left-4 right-4 text-white">
                <h3 className="text-xl font-bold mb-2 drop-shadow-lg">{video.title}</h3>
                <p className="text-sm text-gray-200 mb-3 drop-shadow-lg line-clamp-2">
                  {video.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {video.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-white/20 backdrop-blur-sm text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Swipe Indicators */}
              <div className="absolute inset-0 pointer-events-none">
                {swipeDirection === 'left' && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <div className="text-6xl animate-pulse">👎</div>
                  </div>
                )}
                {swipeDirection === 'right' && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <div className="text-6xl animate-pulse">👍</div>
                  </div>
                )}
                {swipeDirection === 'up' && (
                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                    <div className="text-4xl animate-bounce">⬆️ Next</div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute right-4 bottom-32 flex flex-col space-y-4">
                {/* Like Button */}
                <button
                  onClick={() => handleSwipeEnd('right')}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-green-500/50 transition-all"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                </button>

                {/* Dislike Button */}
                <button
                  onClick={() => handleSwipeEnd('left')}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500/50 transition-all"
                >
                  <svg className="w-6 h-6 rotate-180" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                </button>

                {/* Emoji Button */}
                <button
                  onClick={() => setShowEmojiBar(!showEmojiBar)}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-yellow-500/50 transition-all"
                >
                  <span className="text-xl">😊</span>
                </button>

                {/* Next Button */}
                <button
                  onClick={() => handleSwipeEnd('up')}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-blue-500/50 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="absolute top-4 left-4 right-16">
                <div className="flex space-x-1">
                  {videos.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full ${
                        index <= currentVideoIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Video Counter */}
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
                {currentVideoIndex + 1}/{videos.length}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Emoji Reaction Bar */}
      {showEmojiBar && (
        <div className="absolute bottom-32 left-4 right-20 bg-black/80 backdrop-blur-sm rounded-2xl p-4">
          <div className="grid grid-cols-4 gap-3">
            {EMOJI_REACTIONS.map((reaction) => (
              <button
                key={reaction.key}
                onClick={() => handleEmojiReaction(reaction)}
                className="flex flex-col items-center p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <span className="text-2xl mb-1">{reaction.emoji}</span>
                <span className="text-xs text-gray-300">{reaction.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reaction Feedback */}
      {reactionFeedback && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-2xl px-6 py-3 text-white text-lg font-bold animate-bounce">
          {reactionFeedback}
        </div>
      )}

      {/* Swipe Instructions (shown on first video) */}
      {currentVideoIndex === 0 && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-2xl p-4 text-white text-center">
          <p className="text-sm mb-2 font-medium">Swipe to interact:</p>
          <div className="flex justify-around text-xs">
            <span>← Dislike</span>
            <span>→ Like</span>
            <span>↑ Next</span>
            <span>😊 React</span>
          </div>
        </div>
      )}
    </div>
  )
} 