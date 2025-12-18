#!/bin/bash

echo "Starting StudLink services..."

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
    # Перевірити, чи MongoDB вже працює
    if pgrep -f "mongod.*dbpath" >/dev/null; then
        print_success "MongoDB is already running"
        return 0
    fi
    
    print_status "Starting MongoDB..."

    # Локальні директорії даних та логів у межах проєкту (уникаємо прав доступу)
    PROJECT_ROOT="$(pwd)"
    MONGO_DATA_DIR="$PROJECT_ROOT/.data/mongodb"
    MONGO_LOG_DIR="$PROJECT_ROOT/.data/logs"
    MONGO_LOG_FILE="$MONGO_LOG_DIR/mongo.log"

    # Якщо порт 27017 вже зайнятий (ймовірно, інший mongod працює) — використовуємо його і не стартуємо новий
    if lsof -i tcp:27017 -sTCP:LISTEN >/dev/null 2>&1; then
        print_warning "MongoDB port 27017 is already in use. Assuming MongoDB is running; skipping start."
        return 0
    fi

    # Створити директорії, якщо відсутні
    mkdir -p "$MONGO_DATA_DIR"
    mkdir -p "$MONGO_LOG_DIR"

    # Опції запуску MongoDB
    MONGO_OPTS=(--dbpath "$MONGO_DATA_DIR" --logpath "$MONGO_LOG_FILE" --bind_ip 127.0.0.1 --logappend)

    # Спроба запуску з --fork
    mongod "${MONGO_OPTS[@]}" --fork

    if [ $? -ne 0 ]; then
        print_warning "MongoDB failed to start with --fork. Showing last 50 log lines:"
        if [ -f "$MONGO_LOG_FILE" ]; then
            tail -n 50 "$MONGO_LOG_FILE" || true
        else
            print_warning "Mongo log file not found at $MONGO_LOG_FILE"
        fi

        print_status "Attempting to remove stale lock and repair..."
        rm -f "$MONGO_DATA_DIR/mongod.lock" 2>/dev/null || true
        rm -f /tmp/mongodb-*.sock 2>/dev/null || true
        mongod --dbpath "$MONGO_DATA_DIR" --repair >> "$MONGO_LOG_FILE" 2>&1 || true

        print_status "Retrying MongoDB start..."
        mongod "${MONGO_OPTS[@]}" --fork
        if [ $? -ne 0 ]; then
            print_error "Failed to start MongoDB after repair. See log: $MONGO_LOG_FILE"
            exit 1
        fi
    fi

    print_success "MongoDB started successfully"
}

# Запуск Backend
start_backend() {
    # Перевірити, чи Backend вже працює
    if pgrep -f "node.*server.js" >/dev/null; then
        print_success "Backend is already running"
        return 0
    fi
    
    print_status "Starting Backend..."
    
    cd Backend
    
    # Перевірити, чи встановлені залежності
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install
    fi
    
    # Запустити backend в фоновому режимі
    npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    
    cd ..
    
    # Очікувати запуску backend
    if wait_for_service "http://localhost:4000/api/health" "Backend"; then
        print_success "Backend started successfully (PID: $BACKEND_PID)"
    else
        print_error "Backend failed to start"
        print_status "Check backend.log for errors: tail -f backend.log"
        exit 1
    fi
}

# Запуск Frontend
start_frontend() {
    # Перевірити, чи Frontend вже працює
    if pgrep -f "vite" >/dev/null; then
        print_success "Frontend is already running"
        return 0
    fi
    
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
    echo "Available services:"
    echo "   • MongoDB:    mongodb://localhost:27017"
    echo "   • Backend:    http://localhost:4000"
    echo "   • Frontend:   http://localhost:5176"
    echo ""
    echo "Logs:"
    echo "   • Backend:    tail -f backend.log"
    echo "   • Frontend:   tail -f frontend.log"
    echo ""
    echo " To stop all services: ./stop-all.sh"
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
