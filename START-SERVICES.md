# 🚀 Запуск сервісів для macOS

## 🎯 Автоматичний запуск

```bash
./start-all.sh
```

## 🛑 Зупинка сервісів

```bash
./stop-all.sh
```

## 🔧 Ручний запуск

### 1. MongoDB
```bash
# Створити директорію для даних
mkdir -p ~/data/db

# Запустити MongoDB
mongod --dbpath ~/data/db
```

### 2. Backend
```bash
cd Backend
npm start
```

### 3. Frontend
```bash
cd frontend
npm run dev
```

## 🌐 Доступні сервіси

- **MongoDB**: http://localhost:27017
- **Backend API**: http://localhost:4000
- **Frontend**: http://localhost:5174

## 👤 Тестові дані

**Студент:**
- Email: `student@lnu.edu.ua`
- Password: `password123`

**Адміністратор:**
- Email: `admin@lpnu.ua`
- Password: `password123`

## 📋 Порядок запуску

1. Спочатку MongoDB
2. Потім Backend
3. Далі Frontend

## 🛑 Зупинка сервісів

### Автоматично
```bash
./stop-all.sh
```

### Ручно
Натиснути `Ctrl+C` в терміналі з `start-all.sh` або закрити окремі термінали