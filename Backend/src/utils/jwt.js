import jwt from 'jsonwebtoken';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh';

export function signAccess(payload, expiresIn = '1h') {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn });
}
export function verifyAccess(token) {
    return jwt.verify(token, ACCESS_SECRET);
}
export function signRefresh(payload, expiresIn = '30d') {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn });
}
export function verifyRefresh(token) {
    return jwt.verify(token, REFRESH_SECRET);
}
