import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access';

export function authRequired(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Unauthorized' });

    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, ACCESS_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

export function signJwt(payload, expiresIn = '1h') {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn });
}
