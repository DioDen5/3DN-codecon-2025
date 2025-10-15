import { useEffect, useState } from 'react';
import { getById } from '../api/announcements';
import { countsAnnouncement, toggleAnnouncement } from '../api/reactions';
import { list as listComments, create as createComment } from '../api/comments';
import RepliesList from './RepliesList';
import CommentInput from './CommentInput';

export default function PostExpanded({ id }) {
    const [post, setPost] = useState(null);
    const [counts, setCounts] = useState({ likes: 0, dislikes: 0, score: 0 });
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [p, cts, cmts] = await Promise.all([
                    getById(id),
                    countsAnnouncement(id),
                    listComments(id, { limit: 50 }),
                ]);
                if (!p) throw new Error('Announcement not found');
                if (mounted) { setPost(p); setCounts(cts); setComments(cmts); }
            } catch (e) {
                setErr(e?.response?.data?.error || e.message);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    async function onVote(v) {
        try { setCounts(await toggleAnnouncement(id, v)); } catch {}
    }

    async function onCreateComment(body) {
        const doc = await createComment(id, body);
        setComments(prev => [doc, ...prev]);
    }

    if (loading) return <div className="p-4">Завантаження…</div>;
    if (err) return <div className="p-4 text-red-600">{err}</div>;
    if (!post) return null;

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-semibold">{post.title}</h1>
            <p className="text-gray-800 whitespace-pre-wrap">{post.body}</p>

            <div className="flex gap-3">
                <button onClick={() => onVote(1)} className="px-2 py-1 border rounded">👍 {counts.likes}</button>
                <button onClick={() => onVote(-1)} className="px-2 py-1 border rounded">👎 {counts.dislikes}</button>
                <span className="text-gray-500">Коментарі: {post.metrics?.comments ?? comments.length}</span>
            </div>

            <section>
                <h2 className="text-lg font-semibold mb-2">Коментарі</h2>
                <CommentInput onSubmit={onCreateComment} />
                <RepliesList items={comments} />
            </section>
        </div>
    );
}
