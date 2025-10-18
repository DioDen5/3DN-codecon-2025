#!/bin/bash

echo "🚀 Starting all services for macOS..."

echo ""
echo "📁 Creating MongoDB data directory..."
mkdir -p ~/data/db

echo ""
echo "🍃 Starting MongoDB..."
mongod --dbpath ~/data/db &
MONGO_PID=$!

echo ""
echo "⏳ Waiting for MongoDB to start..."
sleep 5

echo ""
echo "🔧 Starting Backend..."
cd Backend && npm start &
BACKEND_PID=$!

echo ""
echo "⏳ Waiting for Backend to start..."
sleep 5

echo ""
echo "🎨 Starting Frontend..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Services:"
echo "   MongoDB: http://localhost:27017"
echo "   Backend: http://localhost:4000"
echo "   Frontend: http://localhost:5174"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $MONGO_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped."
    exit 0
}

trap cleanup SIGINT
wait
