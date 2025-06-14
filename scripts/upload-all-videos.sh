#!/bin/bash

# Upload All Videos Script for ScrollNet
# Usage: ./scripts/upload-all-videos.sh [directory_path]

# Default to test directory if no argument provided
DIRECTORY=${1:-"./test"}

# Load environment variables
if [ -f "env.local" ]; then
    export $(grep -v '^#' env.local | grep -v '^$' | xargs)
elif [ -f ".env" ]; then
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

# Use environment variable or fallback to localhost
SERVER_URL=${SERVER_URL:-"http://localhost:3001"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:3004"}

echo "🎬 ScrollNet Bulk Video Upload"
echo "==============================="
echo "📁 Directory: $DIRECTORY"
echo "🌐 Server: $SERVER_URL"
echo ""

# Check if directory exists
if [ ! -d "$DIRECTORY" ]; then
    echo "❌ Error: Directory '$DIRECTORY' does not exist"
    exit 1
fi

# Check if server is running
if ! curl -s "$SERVER_URL/api/health" > /dev/null; then
    echo "❌ Error: Server is not running at $SERVER_URL"
    echo "💡 Please start the server with: npm run dev:backend"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Find all video files (macOS compatible)
VIDEO_FILES=$(find "$DIRECTORY" -type f \( -iname "*.mp4" -o -iname "*.avi" -o -iname "*.mov" -o -iname "*.wmv" -o -iname "*.flv" -o -iname "*.webm" -o -iname "*.mkv" -o -iname "*.m4v" \))

if [ -z "$VIDEO_FILES" ]; then
    echo "❌ No video files found in $DIRECTORY"
    exit 1
fi

# Count total files
TOTAL_FILES=$(echo "$VIDEO_FILES" | wc -l | tr -d ' ')
echo "📊 Found $TOTAL_FILES video files to upload"
echo ""

# Upload each file
CURRENT=0
SUCCESSFUL=0
FAILED=0

while IFS= read -r file; do
    CURRENT=$((CURRENT + 1))
    FILENAME=$(basename "$file")
    TITLE=$(echo "$FILENAME" | sed 's/\.[^.]*$//' | sed 's/_/ /g' | sed 's/\b\w/\U&/g')
    
    echo "[$CURRENT/$TOTAL_FILES] Uploading: $FILENAME"
    echo "📝 Title: $TITLE"
    
    # Upload the file
    RESPONSE=$(curl -s -X POST "$SERVER_URL/api/upload/video" \
        -F "video=@$file" \
        -F "title=$TITLE" \
        -F "description=Uploaded via bulk upload script" \
        -F "tags=bulk,upload,test")
    
    # Check if upload was successful
    if echo "$RESPONSE" | grep -q '"success":true'; then
        VIDEO_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        echo "✅ Success! Video ID: $VIDEO_ID"
        SUCCESSFUL=$((SUCCESSFUL + 1))
    else
        ERROR_MSG=$(echo "$RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        echo "❌ Failed: $ERROR_MSG"
        FAILED=$((FAILED + 1))
    fi
    
    echo ""
    
    # Small delay to avoid overwhelming the server
    sleep 0.5
done <<< "$VIDEO_FILES"

echo "🎉 Upload Complete!"
echo "==================="
echo "📊 Total files: $TOTAL_FILES"
echo "✅ Successful: $SUCCESSFUL"
echo "❌ Failed: $FAILED"
echo ""

if [ $SUCCESSFUL -gt 0 ]; then
    echo "🎬 Your videos are now available in the ScrollNet app!"
    echo "🌐 Check them at: $FRONTEND_URL"
fi 