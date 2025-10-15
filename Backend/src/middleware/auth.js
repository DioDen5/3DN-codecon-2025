import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ENV } from '../config/env.js';

export function signJwt(payload) {
    return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });
}

export function authRequired(req,res,next){
    const h = req.headers.authorization ?? '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    try {
        if (!token) throw new Error('No token');
        req.user = jwt.verify(token, ENV.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({error:'Unauthorized'});
    }
}
