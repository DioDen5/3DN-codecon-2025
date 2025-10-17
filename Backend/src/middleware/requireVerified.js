export function requireVerified(req, res, next) {
    const u = req.user;
    if (!u) return res.status(401).json({ error: 'Unauthorized' });

    if (u.role === 'admin' || u.role === 'moderator') {
        return next();
    }

    if (u.role === 'student' && u.status === 'verified') {
        return next();
    }

    return res.status(403).json({ error: 'Verified student only' });
}
