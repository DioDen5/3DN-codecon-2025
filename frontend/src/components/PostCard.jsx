import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { countsAnnouncement, toggleAnnouncement } from '../api/reactions';

export default function PostCard({ post }) {
    const { _id, title, body, metrics } = post;
    const [counts, setCounts] = useState({ likes: 0, dislikes: 0, score: 0 });
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try { const c = await countsAnnouncement(_id); if (mounted) setCounts(c); } catch {}
        })();
        return () => { mounted = false; };
    }, [_id]);

    async function vote(v) {
        if (busy) return;
        setBusy(true);
        const prev = counts;
        const optimistic = v === 1
            ? { ...counts, likes: counts.likes + 1, score: counts.score + 1 }
            : { ...counts, dislikes: counts.dislikes + 1, score: counts.score - 1 };
        setCounts(optimistic);
        try { setCounts(await toggleAnnouncement(_id, v)); } catch { setCounts(prev); }
        finally { setBusy(false); }
    }

    return (
        <article className="border rounded p-4">
            <Link to={`/forum/${_id}`} className="text-lg font-semibold hover:underline">{title}</Link>
            <p className="text-sm text-gray-700 mt-2 line-clamp-3">{body}</p>
            <div className="mt-3 flex items-center gap-3 text-sm">
                <button disabled={busy} onClick={()=>vote(1)} className="px-2 py-1 border rounded">👍 {counts.likes}</button>
                <button disabled={busy} onClick={()=>vote(-1)} className="px-2 py-1 border rounded">👎 {counts.dislikes}</button>
                <span className="text-gray-500">Коментарі: {metrics?.comments ?? 0}</span>
            </div>
        </article>
    );
}
