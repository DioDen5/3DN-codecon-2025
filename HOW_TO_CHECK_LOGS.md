# Як переглядати логи

## Логи Backend

### Варіант 1: Термінал де запущений backend
Просто подивіться в термінал, де запущений `npm start` в папці `Backend/`

### Варіант 2: Лог файл
```bash
tail -f backend.log
```

### Варіант 3: Повні логи в реальному часі
```bash
# Знайти PID процесу
ps aux | grep "node.*server.js"

# Подивитись логи через lsof (якщо логується в файл)
tail -f backend.log
```

## Логи Frontend

### Варіант 1: Консоль браузера
1. Відкрийте Developer Tools (F12 або Cmd+Option+I на Mac)
2. Перейдіть на вкладку **Console**
3. Там будуть всі `console.log()` з коду

### Варіант 2: Network вкладка
1. Developer Tools (F12)
2. Вкладка **Network**
3. Подивіться запити до `/api/auth/register/check-email`
4. Клікніть на запит → вкладка **Response** щоб побачити відповідь сервера

## Що шукати

### При перевірці email викладача:
- В консолі браузера: `Component render check:` зі значеннями станів
- В консолі браузера: `Clicking "Продовжити реєстрацію" button`
- В консолі backend: `[check-email] Teacher profile exists for...` або `[check-email] User exists for...`

### Якщо щось не працює:
1. Перевірте консоль браузера на помилки (червоні повідомлення)
2. Перевірте Network вкладку - чи відправляються запити?
3. Перевірте Response вкладку - що повертає сервер?

