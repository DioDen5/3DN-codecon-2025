import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

import authRoutes from './routes/auth.routes.js';
import announcementRoutes from './routes/announcements.routes.js';

import commentsRoutes from './routes/comments.routes.js';
import reactionsRoutes from './routes/reactions.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);

app.use('/api', commentsRoutes);
app.use('/api', reactionsRoutes);

connectDB().then(() => {
    app.listen(ENV.PORT, () => console.log(`API on http://localhost:${ENV.PORT}`));
});
