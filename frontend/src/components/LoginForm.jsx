import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

export default function LoginForm() {
    const nav = useNavigate();
    const [email, setEmail] = useState('student@lnu.edu.ua'); // demo
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    async function onSubmit(e) {
        e.preventDefault();
        setErr('');
        setLoading(true);
        try {
            const user = await login(email.trim(), password);
            if (!user) throw new Error('Invalid credentials');
            nav('/forum');
        } catch (e) {
            setErr(e?.response?.data?.error || e.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-4">
            <h1 className="text-xl font-semibold">Увійти</h1>
            {err && <div className="text-red-600 text-sm">{err}</div>}
            <div>
                <label className="block text-sm mb-1">Email</label>
                <input className="w-full border rounded px-3 py-2"
                       value={email} onChange={e=>setEmail(e.target.value)}
                       type="email" autoComplete="email" required />
            </div>
            <div>
                <label className="block text-sm mb-1">Пароль</label>
                <input className="w-full border rounded px-3 py-2"
                       value={password} onChange={e=>setPassword(e.target.value)}
                       type="password" autoComplete="current-password" required />
            </div>
            <button disabled={loading}
                    className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50">
                {loading ? 'Входимо…' : 'Увійти'}
            </button>
        </form>
    );
}
