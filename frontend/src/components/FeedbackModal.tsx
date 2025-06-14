'use client'

import { useState } from 'react'

interface FeedbackModalProps {
  videoId: string | null
  onSubmit: (feedbackData: any) => void
  onClose: () => void
}

export function FeedbackModal({ videoId, onSubmit, onClose }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState({
    rating: 0,
    comments: '',
    categories: {
      content_quality: 0,
      engagement: 0,
      relevance: 0,
      technical_quality: 0
    },
    wouldRecommend: null as boolean | null,
    improvementSuggestions: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingChange = (category: string, rating: number) => {
    if (category === 'overall') {
      setFeedback({ ...feedback, rating })
    } else {
      setFeedback({
        ...feedback,
        categories: {
          ...feedback.categories,
          [category]: rating
        }
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Submit to backend
      await fetch('http://localhost:3001/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          ...feedback,
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

  const StarRating = ({ value, onChange, label }: { value: number, onChange: (rating: number) => void, label: string }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl ${star <= value ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-300 transition-colors`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Share Your Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-4 bg-purple-900/20 border border-purple-800 rounded-lg">
          <p className="text-purple-300 text-sm">
            🎉 You've watched 5 videos! Your feedback helps us improve the platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">Overall Experience</h3>
            <StarRating
              value={feedback.rating}
              onChange={(rating) => handleRatingChange('overall', rating)}
              label="Overall Rating"
            />
          </div>

          {/* Category Ratings */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">Rate by Category</h3>
            <div className="space-y-3">
              <StarRating
                value={feedback.categories.content_quality}
                onChange={(rating) => handleRatingChange('content_quality', rating)}
                label="Content Quality"
              />
              <StarRating
                value={feedback.categories.engagement}
                onChange={(rating) => handleRatingChange('engagement', rating)}
                label="Engagement"
              />
              <StarRating
                value={feedback.categories.relevance}
                onChange={(rating) => handleRatingChange('relevance', rating)}
                label="Relevance"
              />
              <StarRating
                value={feedback.categories.technical_quality}
                onChange={(rating) => handleRatingChange('technical_quality', rating)}
                label="Technical Quality"
              />
            </div>
          </div>

          {/* Recommendation */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">Would you recommend this content?</h3>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setFeedback({ ...feedback, wouldRecommend: true })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  feedback.wouldRecommend === true
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setFeedback({ ...feedback, wouldRecommend: false })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  feedback.wouldRecommend === false
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">Additional Comments</h3>
            <textarea
              value={feedback.comments}
              onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
              placeholder="What did you like or dislike about the videos?"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Improvement Suggestions */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white">Suggestions for Improvement</h3>
            <textarea
              value={feedback.improvementSuggestions}
              onChange={(e) => setFeedback({ ...feedback, improvementSuggestions: e.target.value })}
              placeholder="How can we make the experience better?"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting || feedback.rating === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 