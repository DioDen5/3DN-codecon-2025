export function requireVerified(req, res, next) {
    const u = req.user;
    if (!u) return res.status(401).json({ error: 'Unauthorized' });

    console.log('User verification check:', { 
        id: u.id, 
        role: u.role, 
        status: u.status 
    });

    if (u.role === 'admin' || u.role === 'moderator') {
        console.log('Access granted: admin/moderator');
        return next();
    }

    if (u.role === 'student' && u.status === 'verified') {
        console.log('Access granted: verified student');
        return next();
    }

    console.log('Access denied:', { role: u.role, status: u.status });
    return res.status(403).json({ error: 'Verified student only' });
}
