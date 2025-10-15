import { useState } from 'react';

export default function CommentInput({ onSubmit }) {
    const [value, setValue] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    async function handleSend(e) {
        e.preventDefault();
        if (!value.trim()) return;
        setErr('');
        setBusy(true);
        try {
            await onSubmit(value.trim());
            setValue('');
        } catch (e) {
            setErr(e?.response?.data?.error || e.message || 'Помилка');
        } finally {
            setBusy(false);
        }
    }

    return (
        <form onSubmit={handleSend} className="space-y-2 mb-4">
            {err && <div className="text-sm text-red-600">{err}</div>}
            <textarea
                className="w-full border rounded p-2"
                rows={3}
                placeholder="Напишіть коментар…"
                value={value}
                onChange={(e)=>setValue(e.target.value)}
            />
            <button disabled={busy} className="bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50">
                {busy ? 'Відправляємо…' : 'Надіслати'}
            </button>
        </form>
    );
}
