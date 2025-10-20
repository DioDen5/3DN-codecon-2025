# 🚀 StudLink Development Environment

## 🎯 Швидкий запуск

```bash
# Запустити всі сервіси
./start-all.sh

# Зупинити всі сервіси
./stop-all.sh
```

## 🌐 Доступні сервіси

- **MongoDB**: `mongodb://localhost:27017`
- **Backend API**: `http://localhost:4000`
- **Frontend**: `http://localhost:5176`

## 🔧 Ручний запуск

### 1. MongoDB
```bash
# Створити директорії
mkdir -p /opt/homebrew/var/mongodb
mkdir -p /opt/homebrew/var/log/mongodb

# Запустити MongoDB
mongod --dbpath /opt/homebrew/var/mongodb --logpath /opt/homebrew/var/log/mongodb/mongo.log --fork
```

### 2. Backend
```bash
cd Backend
npm install  # якщо вперше
npm start
```

### 3. Frontend
```bash
cd frontend
npm install  # якщо вперше
npm run dev
```

## 📋 Особливості

### Автоматичний скрипт `start-all.sh`:
- ✅ Перевіряє наявність залежностей
- ✅ Встановлює їх автоматично при потребі
- ✅ Очищає кеш Vite
- ✅ Запускає сервіси в правильному порядку
- ✅ Чекає готовності кожного сервісу
- ✅ Зберігає PID для коректного зупинення
- ✅ Показує кольоровий вивід зі статусом

### Автоматичний скрипт `stop-all.sh`:
- ✅ Graceful shutdown (спочатку SIGTERM, потім SIGKILL)
- ✅ Зупиняє сервіси за PID файлами
- ✅ Знаходить та зупиняє всі процеси StudLink
- ✅ Очищає кеш та тимчасові файли
- ✅ Показує фінальний статус

## 🐛 Вирішення проблем

### Порт зайнятий
```bash
# Перевірити, що використовує порт
lsof -i :5176
lsof -i :4000
lsof -i :27017

# Зупинити всі сервіси
./stop-all.sh
```

### Кеш проблеми
```bash
# Очистити кеш Vite
rm -rf frontend/node_modules/.vite
rm -rf frontend/dist

# Перезапустити
./start-all.sh
```

### MongoDB не запускається
```bash
# Перевірити, чи не працює вже
pgrep mongod

# Зупинити всі процеси MongoDB
pkill mongod

# Запустити знову
./start-all.sh
```

## 📊 Логи

- **Backend**: `tail -f backend.log`
- **Frontend**: `tail -f frontend.log`
- **MongoDB**: `/opt/homebrew/var/log/mongodb/mongo.log`

## 🔄 Оновлення

```bash
# Оновити залежності
cd Backend && npm update
cd ../frontend && npm update

# Перезапустити сервіси
./stop-all.sh
./start-all.sh
```