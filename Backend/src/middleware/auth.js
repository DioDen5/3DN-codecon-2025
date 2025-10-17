import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export function signJwt(payload, type = 'access') {
    const secret = ENV.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');

    const expiresIn = type === 'refresh'
        ? '30d'
        : '1h';

    return jwt.sign(payload, secret, { expiresIn });
}


export function verifyJwt(token, _type = 'access') {
    try {
        const secret = ENV.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET is not set');
        return jwt.verify(token, secret);
    } catch {
        return null;
    }
}


export function authRequired(req, res, next) {
    const h = req.headers?.authorization || '';
    const [, token] = h.split(' ');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const payload = verifyJwt(token, 'access');
    if (!payload?.id) return res.status(401).json({ error: 'Unauthorized' });

    console.log('Auth payload:', payload);
    req.user = payload; // { id, role?, status? }
    next();
}
