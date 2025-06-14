#!/bin/bash

# Development Startup Script for ScrollNet
# This script starts both backend and frontend with proper port management

set -e

echo "🚀 ScrollNet Development Startup"
echo "================================="

# Load environment variables
if [ -f "env.local" ]; then
    export $(grep -v '^#' env.local | grep -v '^$' | xargs)
    echo "✅ Loaded env.local"
elif [ -f ".env" ]; then
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
    echo "✅ Loaded .env"
else
    echo "⚠️  No environment file found, using defaults"
fi

# Set default ports if not defined
BACKEND_PORT=${PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3004}
SERVER_URL=${SERVER_URL:-"http://localhost:$BACKEND_PORT"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:$FRONTEND_PORT"}

echo "📊 Configuration:"
echo "   Backend Port: $BACKEND_PORT"
echo "   Frontend Port: $FRONTEND_PORT"
echo "   Server URL: $SERVER_URL"
echo "   Frontend URL: $FRONTEND_URL"
echo ""

# Kill any existing processes on these ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:$BACKEND_PORT,$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
pkill -f "node.*src/index.js" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true
sleep 2

# Check if ports are available
check_port() {
    local port=$1
    local name=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ Error: Port $port is still in use (needed for $name)"
        echo "   Please manually kill the process using: lsof -ti:$port | xargs kill -9"
        exit 1
    fi
}

check_port $BACKEND_PORT "Backend"
check_port $FRONTEND_PORT "Frontend"

echo "✅ Ports are available"
echo ""

# Start backend
echo "🔧 Starting backend on port $BACKEND_PORT..."
npm run dev:backend &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if curl -s "$SERVER_URL/api/health" >/dev/null 2>&1; then
        echo "✅ Backend is running at $SERVER_URL"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start after 30 seconds"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# Start frontend
echo "🎨 Starting frontend on port $FRONTEND_PORT..."
cd frontend
FRONTEND_PORT=$FRONTEND_PORT npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
for i in {1..30}; do
    if curl -s "$FRONTEND_URL" >/dev/null 2>&1; then
        echo "✅ Frontend is running at $FRONTEND_URL"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Frontend failed to start after 30 seconds"
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

echo ""
echo "🎉 ScrollNet is now running!"
echo "   📱 Frontend: $FRONTEND_URL"
echo "   🔧 Backend: $SERVER_URL"
echo "   📊 Health Check: $SERVER_URL/api/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo ""; echo "🛑 Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0' INT

# Keep script running
wait 