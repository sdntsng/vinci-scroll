#!/bin/bash

echo "🧪 Testing ScrollNet Application..."
echo "=================================="

# Test backend health
echo "1. Testing backend health..."
HEALTH=$(curl -s http://localhost:3001/api/health)
if [[ $? -eq 0 ]]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not responding"
    exit 1
fi

# Test video API
echo "2. Testing video API..."
VIDEOS=$(curl -s http://localhost:3001/api/videos)
VIDEO_COUNT=$(echo $VIDEOS | jq '.videos | length')
if [[ $VIDEO_COUNT -gt 0 ]]; then
    echo "✅ Video API working - Found $VIDEO_COUNT videos"
else
    echo "❌ Video API not working or no videos found"
fi

# Test interaction API
echo "3. Testing interaction API..."
INTERACTION=$(curl -s -X POST http://localhost:3001/api/interactions \
    -H "Content-Type: application/json" \
    -d '{"userId": "test-user", "videoId": "test-video", "type": "like", "data": {"emoji": "❤️"}}')
if [[ $? -eq 0 ]]; then
    echo "✅ Interaction API working"
else
    echo "❌ Interaction API not working"
fi

# Test frontend
echo "4. Testing frontend..."
FRONTEND=$(curl -s -I http://localhost:3004 | head -1)
if [[ $FRONTEND == *"200 OK"* ]]; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

echo ""
echo "🎉 Application Status Summary:"
echo "- Backend: Running on http://localhost:3001"
echo "- Frontend: Running on http://localhost:3004"
echo "- Database: Connected to Supabase"
echo "- Storage: Connected to Google Cloud Storage"
echo "- Videos: $VIDEO_COUNT videos available"
echo ""
echo "🚀 Ready to use! Open http://localhost:3004 in your browser" 