export function requireVerified(req,res,next){
    if (req.user?.status !== 'verified') {
        return res.status(403).json({ error: 'Verified student only' });
    }
    next();
}
