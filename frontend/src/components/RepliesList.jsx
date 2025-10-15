import { useEffect, useState } from 'react';
import { countsComment, toggleComment } from '../api/reactions';

function CommentRow({ c }) {
    const [counts, setCounts] = useState({ likes: 0, dislikes: 0, score: 0 });
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try { const cc = await countsComment(c._id); if (mounted) setCounts(cc); } catch {}
        })();
        return () => { mounted = false; };
    }, [c._id]);

    async function vote(v) {
        if (busy) return;
        setBusy(true);
        const prev = counts;
        const optimistic = v === 1
            ? { ...counts, likes: counts.likes + 1, score: counts.score + 1 }
            : { ...counts, dislikes: counts.dislikes + 1, score: counts.score - 1 };
        setCounts(optimistic);
        try { setCounts(await toggleComment(c._id, v)); } catch { setCounts(prev); }
        finally { setBusy(false); }
    }

    return (
        <div className="border rounded p-3">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{c.body}</div>
            <div className="mt-2 flex items-center gap-3 text-sm">
                <button disabled={busy} onClick={() => vote(1)} className="px-2 py-1 border rounded">👍 {counts.likes}</button>
                <button disabled={busy} onClick={() => vote(-1)} className="px-2 py-1 border rounded">👎 {counts.dislikes}</button>
                <span className="text-gray-500">Статус: {c.status}</span>
            </div>
        </div>
    );
}

export default function RepliesList({ items }) {
    if (!items?.length) return <div className="text-sm text-gray-500">Будьте першим, хто прокоментує.</div>;
    return (
        <div className="space-y-3">
            {items.map(c => <CommentRow key={c._id} c={c} />)}
        </div>
    );
}
