import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { connectDB } from './config/db.js'
import { ENV } from './config/env.js'

import authRoutes from './routes/auth.routes.js'
import announcementRoutes from './routes/announcements.routes.js'
import commentsRoutes from './routes/comments.routes.js'
import reactionsRoutes from './routes/reactions.routes.js'
import teachersRoutes from './routes/teachers.routes.js'
import teacherCommentsRoutes from './routes/teacher-comments.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import userStatsRoutes from './routes/user-stats.routes.js'
import nameChangeRoutes from './routes/name-change.routes.js'
import adminRoutes from './routes/admin.routes.js'

const app = express()

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5176'

app.use(
    helmet({
        crossOriginResourcePolicy: false, // дозволяє завантаження з фронту
    })
)

app.use(
    cors({
        origin: FRONTEND_ORIGIN,
        credentials: true, // потрібне для httpOnly-cookie
        methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        optionsSuccessStatus: 204,
    })
)

app.use(cookieParser())

app.use(express.json({ limit: '1mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api', commentsRoutes)
app.use('/api', reactionsRoutes)
app.use('/api/teachers', teachersRoutes)
app.use('/api/teacher-comments', teacherCommentsRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/user', userStatsRoutes)
app.use('/api/name-change', nameChangeRoutes)
app.use('/api/admin', adminRoutes)

// Додаємо логування всіх запитів
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' })
})

connectDB().then(() => {
    app.listen(ENV.PORT, () => {
        console.log(`✅ API running on http://localhost:${ENV.PORT}`)
        console.log(`CORS allowed origin: ${FRONTEND_ORIGIN}`)
    })
})
