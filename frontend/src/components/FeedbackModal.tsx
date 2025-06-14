'use client'

import { useState } from 'react'
import { API_URLS } from '../config/api'

interface FeedbackModalProps {
  videoId: string | null
  onSubmit: (feedbackData: any) => void
  onClose: () => void
}

export function FeedbackModal({ videoId, onSubmit, onClose }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState({
    whatDidYouSee: '',
    whyDidYouReact: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that both questions are answered
    if (!feedback.whatDidYouSee.trim() || !feedback.whyDidYouReact.trim()) {
      alert('Please answer both questions before submitting.')
      return
    }
    
    setIsSubmitting(true)

    try {
      // Submit to backend
      await fetch(API_URLS.FEEDBACK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          whatDidYouSee: feedback.whatDidYouSee,
          whyDidYouReact: feedback.whyDidYouReact,
          timestamp: new Date().toISOString()
        }),
      })
      
      onSubmit(feedback)
    } catch (error) {
      console.log('Feedback submitted (MVP mode):', feedback)
      onSubmit(feedback)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Quick Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 p-4 bg-purple-900/20 border border-purple-800 rounded-xl">
          <p className="text-purple-300 text-sm text-center">
            🎉 You've watched 5 videos! Help us improve by sharing your thoughts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question 1: What did you see? */}
          <div className="space-y-3">
            <label className="block text-lg font-medium text-white">
              What did you see?
            </label>
            <textarea
              value={feedback.whatDidYouSee}
              onChange={(e) => setFeedback({ ...feedback, whatDidYouSee: e.target.value })}
              placeholder="Describe what you saw in the videos..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>

          {/* Question 2: Why did you react? */}
          <div className="space-y-3">
            <label className="block text-lg font-medium text-white">
              Why did you react?
            </label>
            <textarea
              value={feedback.whyDidYouReact}
              onChange={(e) => setFeedback({ ...feedback, whyDidYouReact: e.target.value })}
              placeholder="What made you like, dislike, or react with emojis?"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !feedback.whatDidYouSee.trim() || !feedback.whyDidYouReact.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-medium transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 