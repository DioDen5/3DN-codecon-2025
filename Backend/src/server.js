import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

import authRoutes from './routes/auth.routes.js';
import announcementRoutes from './routes/announcements.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);

connectDB().then(() => {
    app.listen(ENV.PORT, () => console.log(`API on http://localhost:${ENV.PORT}`));
});
