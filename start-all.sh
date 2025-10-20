#!/bin/bash

echo "🚀 Starting StudLink services..."

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функція для виводу кольорового тексту
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

# Перевірити, чи вже запущені сервіси
check_running_services() {
    print_status "Checking for running services..."
    
    if pgrep -f "mongod.*dbpath" >/dev/null; then
        print_warning "MongoDB is already running"
    fi
    
    if pgrep -f "node.*server.js" >/dev/null; then
        print_warning "Backend is already running"
    fi
    
    if pgrep -f "vite" >/dev/null; then
        print_warning "Frontend is already running"
    fi
}

# Функція для очікування сервісу
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to start..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start after $max_attempts seconds"
    return 1
}

# Очистити кеш Vite
clean_vite_cache() {
    print_status "Cleaning Vite cache..."
    if [ -d "frontend" ]; then
        cd frontend
        rm -rf node_modules/.vite
        rm -rf dist
        cd ..
        print_success "Vite cache cleaned"
    else
        print_warning "Frontend directory not found, skipping cache cleanup"
    fi
}

# Запуск MongoDB
start_mongodb() {
    print_status "Starting MongoDB..."
    
    # Створити директорію для логів
    mkdir -p /opt/homebrew/var/log/mongodb
    
    # Запустити MongoDB в фоновому режимі
    mongod --dbpath /opt/homebrew/var/mongodb --logpath /opt/homebrew/var/log/mongodb/mongo.log --fork
    
    if [ $? -eq 0 ]; then
        print_success "MongoDB started successfully"
    else
        print_error "Failed to start MongoDB"
        exit 1
    fi
}

# Запуск Backend
start_backend() {
    print_status "Starting Backend..."
    
    cd Backend
    
    # Перевірити, чи встановлені залежності
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install
    fi
    
    # Запустити backend в фоновому режимі
    npm start > ../backend.log 2>&1 &
    BACKEND_PID=$!
    
    cd ..
    
    # Очікувати запуску backend
    if wait_for_service "http://localhost:4000/api/health" "Backend"; then
        print_success "Backend started successfully (PID: $BACKEND_PID)"
    else
        print_error "Backend failed to start"
        exit 1
    fi
}

# Запуск Frontend
start_frontend() {
    print_status "Starting Frontend..."
    
    if [ ! -d "frontend" ]; then
        print_error "Frontend directory not found!"
        return 1
    fi
    
    cd frontend
    
    # Перевірити, чи встановлені залежності
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # Очистити кеш Vite
    clean_vite_cache
    
    # Запустити frontend в фоновому режимі
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    cd ..
    
    # Очікувати запуску frontend
    if wait_for_service "http://localhost:5176" "Frontend"; then
        print_success "Frontend started successfully (PID: $FRONTEND_PID)"
    else
        print_warning "Frontend might be running on a different port (check frontend.log)"
    fi
}

# Основна функція
main() {
    echo "=========================================="
    echo "🚀 StudLink Development Environment"
    echo "=========================================="
    echo ""
    
    # Перевірити наявність сервісів
    check_running_services
    
    echo ""
    print_status "Starting services in order..."
    echo ""
    
    # 1. MongoDB
    start_mongodb
    echo ""
    
    # 2. Backend
    start_backend
    echo ""
    
    # 3. Frontend
    start_frontend
    echo ""
    
    echo "=========================================="
    print_success "All services started successfully!"
    echo "=========================================="
    echo ""
    echo "🌐 Available services:"
    echo "   • MongoDB:    mongodb://localhost:27017"
    echo "   • Backend:    http://localhost:4000"
    echo "   • Frontend:   http://localhost:5176"
    echo ""
    echo "📋 Logs:"
    echo "   • Backend:    tail -f backend.log"
    echo "   • Frontend:   tail -f frontend.log"
    echo ""
    echo "🛑 To stop all services: ./stop-all.sh"
    echo ""
    
    # Зберегти PID для можливого зупинення
    echo "$BACKEND_PID" > .backend.pid
    echo "$FRONTEND_PID" > .frontend.pid
}

# Обробка сигналів для graceful shutdown
cleanup() {
    echo ""
    print_status "Shutting down services..."
    
    if [ -f ".backend.pid" ]; then
        BACKEND_PID=$(cat .backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            print_success "Backend stopped"
        fi
        rm -f .backend.pid
    fi
    
    if [ -f ".frontend.pid" ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            print_success "Frontend stopped"
        fi
        rm -f .frontend.pid
    fi
    
    # Зупинити MongoDB
    if pgrep -f "mongod.*dbpath" >/dev/null; then
        pkill -f "mongod.*dbpath"
        print_success "MongoDB stopped"
    fi
    
    print_success "All services stopped"
    exit 0
}

# Встановити обробники сигналів
trap cleanup SIGINT SIGTERM

# Запустити основну функцію
main

# Якщо скрипт не завершився, залишити його працювати
print_status "Services are running. Press Ctrl+C to stop all services."
wait