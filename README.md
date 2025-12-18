# StudLink - Форум для студентів

## Особливості проєкту

- **Форум для обговорень**: Створення та обговорення тем, коментування, реакції
- **Оцінювання викладачів**: Система рейтингів та відгуків про викладачів
- **Аутентифікація**: Реєстрація через корпоративну пошту університету, верифікація через email
- **Профілі користувачів**: Окремі профілі для студентів та викладачів
- **Адмін-панель**: Модерація контенту, керування користувачами, верифікація викладачів
- **Пошук та фільтрація**: Пошук викладачів за університетом, факультетом, предметами

## Вимоги до середовища

- Node.js версії 18 або вище
- MongoDB версії 6 або вище
- npm або yarn

## Встановлення та збірка
### 1. Клонування репозиторію

```bash
git clone https://github.com/DioDen5/StudLink
cd StudLink
```

### 2. Встановлення залежностей Backend

```bash
cd Backend
npm install
```

### 3. Встановлення залежностей Frontend

```bash
cd ../frontend
npm install
```

### 4. Налаштування змінних середовища

Створіть файл `Backend/.env` на основі `Backend/.env.example`:

```bash
cd Backend
cp .env.example .env
```

Заповніть необхідні змінні:
- `MONGO_URI` - URI підключення до MongoDB (за замовчуванням: `mongodb://127.0.0.1:27017/studlink`)
- `JWT_SECRET` - Секретний ключ для JWT токенів
- `FRONTEND_ORIGIN` - URL frontend застосунку (за замовчуванням: `http://localhost:5176`)
- `SENDGRID_API_KEY` - API ключ SendGrid для відправки email
- `SENDGRID_FROM_EMAIL` - Email адреса відправника

## Запуск проєкту

### Автоматичний запуск (рекомендовано)

Використовуйте скрипти для автоматичного запуску всіх сервісів:

```bash
# Запустити всі сервіси (MongoDB, Backend, Frontend)
./start-all.sh

# Зупинити всі сервіси
./stop-all.sh
```

### Ручний запуск

#### 1. Запуск MongoDB

```bash
# Створити директорії для даних та логів
mkdir -p .data/mongodb
mkdir -p .data/logs

# Запустити MongoDB
mongod --dbpath .data/mongodb --logpath .data/logs/mongo.log --bind_ip 127.0.0.1 --logappend --fork
```

#### 2. Запуск Backend

```bash
cd Backend
npm run dev
```

Backend буде доступний на `http://localhost:4000`

#### 3. Запуск Frontend

```bash
cd frontend
npm run dev
```

Frontend буде доступний на `http://localhost:5176`

## Доступні сервіси

Після запуску всіх сервісів:

- **MongoDB**: `mongodb://localhost:27017`
- **Backend API**: `http://localhost:4000`
- **Frontend**: `http://localhost:5176`

## Структура проєкту

```
3DN-codecon-2025/
├── Backend/                 # Backend сервер
│   ├── src/
│   │   ├── config/         # Конфігурація (БД, env)
│   │   ├── middleware/     # Middleware (auth, validation)
│   │   ├── models/         # Mongoose моделі
│   │   ├── routes/         # API маршрути
│   │   ├── utils/          # Утиліти (email, hash, jwt)
│   │   └── server.js       # Точка входу сервера
│   └── package.json
├── frontend/               # Frontend застосунок
│   ├── src/
│   │   ├── api/           # API клієнти
│   │   ├── components/    # React компоненти
│   │   ├── contexts/      # React контексти
│   │   ├── pages/         # Сторінки
│   │   ├── state/         # State management
│   │   └── main.jsx       # Точка входу
│   └── package.json
├── start-all.sh           # Скрипт запуску всіх сервісів
├── stop-all.sh            # Скрипт зупинки всіх сервісів
└── README.md              # Цей файл
```

## Основні команди

### Backend

```bash
cd Backend

# Розробка (з автоматичним перезапуском)
npm run dev

# Запуск продакшн версії
npm start

# Засівання тестових даних
npm run seed
npm run seed-demo
```

## Посилання на репозиторій

Проєкт доступний за посиланням: https://github.com/DioDen5/StudLink

