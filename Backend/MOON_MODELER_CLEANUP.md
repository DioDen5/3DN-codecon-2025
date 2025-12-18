# Інструкції для очищення колекції `announcements` в Moon Modeler

## Поля, які потрібно видалити з колекції `announcements`:

### 1. **`tags`** (array of strings)
   - ❌ **Не використовується** - завжди порожній масив
   - ❌ Не відображається в UI
   - ❌ Не використовується в пошуку (пошук тільки по `title`)

### 2. **`isApproved`** (boolean)
   - ❌ **Не використовується** - обговорення одразу публікуються
   - ❌ Не перевіряється при відображенні
   - ❌ Модерація не працює в основному потоці

### 3. **`approvedBy`** (ObjectId, reference to users)
   - ❌ **Не використовується** - частина невикористовуваної модерації

### 4. **`approvedAt`** (date)
   - ❌ **Не використовується** - частина невикористовуваної модерації

### 5. **`moderation`** (object)
   - ❌ **Не використовується** - endpoint `/:id/submit` не використовується
   - Структура:
     - `lastAction` (string)
     - `by` (ObjectId, reference to users)
     - `at` (date)
     - `reason` (string)

### 6. **`aiFlags`** (object)
   - ❌ **Не використовується** - раніше визначено як невикористовуваний
   - Структура:
     - `model` (string)
     - `version` (string)
     - `toxicity` (number)
     - `flags` (array of strings)

---

## Поля, які **ЗАЛИШАЮТЬСЯ** в колекції `announcements`:

### ✅ Обов'язкові поля:
1. **`_id`** (ObjectId) - первинний ключ
2. **`title`** (string, required) - заголовок обговорення
3. **`body`** (string, required) - текст обговорення
4. **`authorId`** (ObjectId, required, reference to users) - автор обговорення
5. **`status`** (string, enum: 'draft', 'pending', 'published', 'hidden') - статус обговорення
6. **`pinned`** (boolean, default: false) - чи закріплене обговорення
7. **`visibility`** (string, enum: 'students', 'public') - видимість обговорення
8. **`publishedAt`** (date, nullable) - дата публікації
9. **`createdAt`** (date) - дата створення
10. **`updatedAt`** (date) - дата оновлення

### ✅ Вкладені об'єкти:
11. **`metrics`** (object) - метрики обговорення
    - `views` (number, default: 0) - кількість переглядів
    - `comments` (number, default: 0) - кількість коментарів

---

## Індекси, які потрібно оновити:

### Видалити:
- ❌ `{ title: 'text', body: 'text', tags: 'text' }` - видалити `tags` з текстового індексу

### Залишити:
- ✅ `{ status: 1, pinned: -1, publishedAt: -1 }` - композитний індекс
- ✅ `{ title: 'text', body: 'text' }` - текстовий індекс (без `tags`)

---

## Як видалити поля в Moon Modeler:

1. Відкрийте колекцію `announcements` в Moon Modeler
2. Видаліть наступні поля:
   - `tags`
   - `isApproved`
   - `approvedBy`
   - `approvedAt`
   - `moderation` (весь об'єкт)
   - `aiFlags` (весь об'єкт)
3. Оновіть текстовий індекс: видаліть `tags` з індексу `{ title: 'text', body: 'text', tags: 'text' }`
4. Збережіть зміни

---

## Після очищення:

Колекція `announcements` має містити тільки ті поля, які реально використовуються в коді:
- Основні поля: `_id`, `title`, `body`, `authorId`, `status`, `pinned`, `visibility`, `publishedAt`, `createdAt`, `updatedAt`
- Вкладений об'єкт: `metrics` (з полями `views` та `comments`)

