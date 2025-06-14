'use client'

interface User {
  id: string
  email: string
  name?: string
}

interface HeaderProps {
  user: User | null
  onLogout: () => void
  videosWatched: number
}

export function Header({ user, onLogout, videosWatched }: HeaderProps) {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              ScrollNet
            </h1>
            <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded-full">
              MVP
            </span>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                <span className="hidden sm:inline">Welcome, </span>
                <span className="font-medium text-white">{user.name || user.email}</span>
              </div>
              <div className="text-sm text-gray-400">
                <span className="font-medium text-purple-400">{videosWatched}</span> videos
              </div>
              <button
                onClick={onLogout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 