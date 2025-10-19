# Налаштування Email для Password Reset

## 1. Gmail налаштування (рекомендовано)

### Крок 1: Увімкніть 2-Factor Authentication
1. Перейдіть до [Google Account Security](https://myaccount.google.com/security)
2. Увімкніть "2-Step Verification"

### Крок 2: Створіть App Password
1. Перейдіть до [App Passwords](https://myaccount.google.com/apppasswords)
2. Виберіть "Mail" та "Other (Custom name)"
3. Введіть назву: "3DN CodeCon"
4. Скопіюйте згенерований пароль (16 символів)

### Крок 3: Налаштуйте змінні середовища
Створіть файл `.env` в папці `Backend/`:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM_NAME=3DN CodeCon

# Frontend
FRONTEND_ORIGIN=http://localhost:5176
```

## 2. Альтернативні SMTP провайдери

### SendGrid
```env
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
```

### Mailgun
```env
EMAIL_USER=your-mailgun-username
EMAIL_PASS=your-mailgun-password
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
```

### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

## 3. Тестування

1. Запустіть backend: `npm start`
2. Спробуйте відправити запит на скидання пароля
3. Перевірте логи - має з'явитися "Password reset email sent successfully"

## 4. Troubleshooting

- **"Invalid login"** - перевірте EMAIL_USER та EMAIL_PASS
- **"Connection timeout"** - перевірте мережу та порт
- **"Authentication failed"** - використовуйте App Password, не звичайний пароль
