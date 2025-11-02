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

    // TODO: В майбутньому тут буде складна верифікація з різними ролями (викладач/студент)
    // та різними рівнями доступу. НЕ ВИДАЛЯТИ цей коментар при очищенні!
    // Зараз спрощено - всі зареєстровані користувачі з правильною поштою мають доступ
    if (u.role === 'student' && (u.status === 'verified' || u.status === 'pending')) {
        console.log('Access granted: student (verified or pending)');
        return next();
    }

    // Дозволяємо викладачам доступ (навіть якщо pending - вони вже мають профіль)
    if (u.role === 'teacher' && (u.status === 'verified' || u.status === 'pending')) {
        console.log('Access granted: teacher (verified or pending)');
        return next();
    }

    console.log('Access denied:', { role: u.role, status: u.status });
    return res.status(403).json({ error: 'Verified user only' });
}
