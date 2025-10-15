import { useEffect, useState } from 'react';
import { listPublished } from '../api/announcements';
import PostCard from '../components/PostCard';

export default function ForumPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const rows = await listPublished();
                if (mounted) setItems(rows);
            } catch (e) {
                setErr(e?.response?.data?.error || e.message);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    if (loading) return <div className="p-4">Завантаження…</div>;
    if (err) return <div className="p-4 text-red-600">{err}</div>;
    if (!items.length) return <div className="p-4 text-gray-500">Поки що немає оголошень.</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-4 p-4">
            {items.map(post => <PostCard key={post._id} post={post} />)}
        </div>
    );
}
