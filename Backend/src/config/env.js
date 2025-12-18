import 'dotenv/config';

export const ENV = {
    PORT: process.env.PORT ?? 4000,
    MONGO_URI: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/studlink',
    JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret'
};
