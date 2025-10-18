#!/bin/bash

echo "🛑 Stopping all services..."

echo ""
echo "🔍 Finding running processes..."

# Знайти всі процеси MongoDB, Node.js, npm та Vite
MONGO_PIDS=$(pgrep -f "mongod.*dbpath" 2>/dev/null || echo "")
NODE_PIDS=$(pgrep -f "node.*server.js" 2>/dev/null || echo "")
NPM_PIDS=$(pgrep -f "npm.*dev" 2>/dev/null || echo "")
VITE_PIDS=$(pgrep -f "vite" 2>/dev/null || echo "")

# Об'єднати всі PID
ALL_PIDS="$MONGO_PIDS $NODE_PIDS $NPM_PIDS $VITE_PIDS"

if [ -z "$ALL_PIDS" ]; then
    echo "✅ No services running"
    exit 0
fi

echo "📋 Found processes:"
if [ ! -z "$MONGO_PIDS" ]; then
    echo "   MongoDB: $MONGO_PIDS"
fi
if [ ! -z "$NODE_PIDS" ]; then
    echo "   Backend: $NODE_PIDS"
fi
if [ ! -z "$NPM_PIDS" ]; then
    echo "   npm: $NPM_PIDS"
fi
if [ ! -z "$VITE_PIDS" ]; then
    echo "   Frontend: $VITE_PIDS"
fi

echo ""
echo "🛑 Stopping processes..."

# Зупинити всі процеси
for pid in $ALL_PIDS; do
    if [ ! -z "$pid" ]; then
        echo "   Stopping PID $pid..."
        kill -9 "$pid" 2>/dev/null || echo "   Process $pid already stopped"
    fi
done

echo ""
echo "⏳ Waiting for processes to stop..."
sleep 2

# Перевірити, чи залишилися процеси
REMAINING=$(pgrep -f "mongod.*dbpath|node.*server.js|npm.*dev|vite" 2>/dev/null || echo "")

if [ ! -z "$REMAINING" ]; then
    echo "⚠️  Some processes still running: $REMAINING"
    echo "🔄 Force killing remaining processes..."
    for pid in $REMAINING; do
        kill -9 "$pid" 2>/dev/null || true
    done
    sleep 1
fi

# Фінальна перевірка
FINAL_CHECK=$(pgrep -f "mongod.*dbpath|node.*server.js|npm.*dev|vite" 2>/dev/null || echo "")

if [ -z "$FINAL_CHECK" ]; then
    echo "✅ All services stopped successfully!"
else
    echo "❌ Some services still running: $FINAL_CHECK"
    echo "   You may need to stop them manually"
fi

echo ""
echo "📍 Services status:"
echo "   MongoDB: $(pgrep -f "mongod.*dbpath" >/dev/null && echo "Running" || echo "Stopped")"
echo "   Backend: $(pgrep -f "node.*server.js" >/dev/null && echo "Running" || echo "Stopped")"
echo "   Frontend: $(pgrep -f "vite" >/dev/null && echo "Running" || echo "Stopped")"
