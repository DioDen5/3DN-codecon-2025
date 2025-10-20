#!/bin/bash

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функції для виводу кольорового тексту
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🛑 Stopping StudLink services..."
echo ""

# Функція для зупинки процесу за PID
stop_process() {
    local pid=$1
    local name=$2
    
    if [ ! -z "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        print_status "Stopping $name (PID: $pid)..."
        kill -TERM "$pid" 2>/dev/null
        
        # Чекати 3 секунди для graceful shutdown
        local count=0
        while kill -0 "$pid" 2>/dev/null && [ $count -lt 3 ]; do
            sleep 1
            count=$((count + 1))
        done
        
        # Якщо процес все ще працює, force kill
        if kill -0 "$pid" 2>/dev/null; then
            print_warning "Force killing $name (PID: $pid)..."
            kill -9 "$pid" 2>/dev/null
        fi
        
        print_success "$name stopped"
    else
        print_warning "$name is not running"
    fi
}

# Зупинити сервіси за PID файлами (якщо є)
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    stop_process "$BACKEND_PID" "Backend"
    rm -f .backend.pid
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    stop_process "$FRONTEND_PID" "Frontend"
    rm -f .frontend.pid
fi

# Знайти та зупинити всі процеси StudLink
print_status "Finding remaining StudLink processes..."

# MongoDB процеси
MONGO_PIDS=$(pgrep -f "mongod.*dbpath" 2>/dev/null || echo "")
if [ ! -z "$MONGO_PIDS" ]; then
    for pid in $MONGO_PIDS; do
        stop_process "$pid" "MongoDB"
    done
fi

# Backend процеси
BACKEND_PIDS=$(pgrep -f "node.*server.js" 2>/dev/null || echo "")
if [ ! -z "$BACKEND_PIDS" ]; then
    for pid in $BACKEND_PIDS; do
        stop_process "$pid" "Backend"
    done
fi

# Frontend процеси (Vite)
VITE_PIDS=$(pgrep -f "vite" 2>/dev/null || echo "")
if [ ! -z "$VITE_PIDS" ]; then
    for pid in $VITE_PIDS; do
        stop_process "$pid" "Frontend (Vite)"
    done
fi

# npm процеси
NPM_PIDS=$(pgrep -f "npm.*dev" 2>/dev/null || echo "")
if [ ! -z "$NPM_PIDS" ]; then
    for pid in $NPM_PIDS; do
        stop_process "$pid" "npm dev"
    done
fi

echo ""
print_status "Final cleanup..."

# Видалити PID файли
rm -f .backend.pid .frontend.pid

# Видалити лог файли
rm -f backend.log frontend.log

# Очистити кеш Vite
if [ -d "frontend/node_modules/.vite" ]; then
    print_status "Cleaning Vite cache..."
    rm -rf frontend/node_modules/.vite
    print_success "Vite cache cleaned"
fi

echo ""
echo "=========================================="
print_success "All StudLink services stopped!"
echo "=========================================="
echo ""

# Фінальна перевірка
print_status "Final status check:"
echo "   MongoDB: $(pgrep -f "mongod.*dbpath" >/dev/null && echo "Still running" || echo "Stopped")"
echo "   Backend: $(pgrep -f "node.*server.js" >/dev/null && echo "Still running" || echo "Stopped")"
echo "   Frontend: $(pgrep -f "vite" >/dev/null && echo "Still running" || echo "Stopped")"

# Перевірити, чи залишилися процеси
REMAINING=$(pgrep -f "mongod.*dbpath|node.*server.js|vite|npm.*dev" 2>/dev/null || echo "")

if [ ! -z "$REMAINING" ]; then
    echo ""
    print_warning "Some processes are still running: $REMAINING"
    print_status "You may need to stop them manually or restart your terminal"
else
    print_success "All processes stopped successfully!"
fi

echo ""
