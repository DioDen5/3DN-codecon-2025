import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { http } from '../api/httpClient';
import { toggleReaction, getAnnouncementCounts } from '../api/reactions';

const ITEMS_PER_PAGE = 3;

const ForumPage = () => {
    const nav = useNavigate();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const [q, setQ] = useState('');
    const [offset, setOffset] = useState(0);

    const [pendingId, setPendingId] = useState(null);

    useEffect(() => {
        let alive = true;
        const load = async () => {
            setLoading(true);
            setErr('');
            try {
                const { data } = await http.get('/announcements', {
                    params: { status: 'published', q: q || undefined }
                });
                if (!alive) return;

                const withCounts = await Promise.all(
                    (data || []).map(async (a) => {
                        try {
                            const counts = await getAnnouncementCounts(a._id);
                            return { ...a, counts };
                        } catch {
                            return { ...a, counts: { likes: 0, dislikes: 0, score: 0 } };
                        }
                    })
                );

                setPosts(withCounts);
            } catch (e) {
                if (!alive) return;
                setErr(e?.response?.data?.error || 'Не вдалося завантажити оголошення');
            } finally {
                if (alive) setLoading(false);
            }
        };
        load();
        return () => { alive = false; };
    }, [q]);

    const current = useMemo(() => {
        const start = offset;
        return posts.slice(start, start + ITEMS_PER_PAGE);
    }, [posts, offset]);

    const pageCount = Math.max(1, Math.ceil(posts.length / ITEMS_PER_PAGE));

    const handleVote = async (id, kind) => {
        const value = kind === 'like' ? 1 : -1;
        if (pendingId) return;
        setPendingId(id);
        try {
            const counts = await toggleReaction('announcement', id, value);
            setPosts((prev) =>
                prev.map((p) => (p._id === id ? { ...p, counts } : p))
            );
        } finally {
            setPendingId(null);
        }
    };

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 px-6 py-10 text-white">
            <div className="max-w-4xl mx-auto relative z-10">
                <h1 className="text-center text-3xl font-semibold mb-8">ОБГОВОРЕННЯ</h1>

                <div className="max-w-xl mx-auto mb-4">
                    <SearchInput value={q} onChange={setQ} />
                </div>

                <div className="flex justify-end items-center mb-6">
                    <button
                        onClick={() => nav('/forum/create')}
                        className="px-4 py-2 bg-white/10 text-white hover:bg-white hover:text-black btn-glow"
                    >
                        + Створити
                    </button>
                </div>

                {loading && <p className="text-center text-white/80">Завантаження…</p>}
                {!!err && !loading && (
                    <p className="text-center text-red-400">{err}</p>
                )}

                {!loading && !err && (
                    <div>
                        {current.length === 0 ? (
                            <p className="text-center text-white/70">Немає оголошень</p>
                        ) : (
                            <div className="space-y-4">
                                {current.map((a) => (
                                    <PostCard
                                        key={a._id}
                                        id={a._id}
                                        username="author" // за потреби підставимо displayName автора, коли бек віддаватиме
                                        date={a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ''}
                                        title={a.title}
                                        content={a.body}
                                        image_url={null}
                                        likes={a.counts?.likes ?? 0}
                                        dislikes={a.counts?.dislikes ?? 0}
                                        comments={a.metrics?.comments ?? 0}
                                        onVote={(id, kind) => handleVote(id, kind)}
                                        pending={pendingId === a._id}
                                        onClick={() => nav(`/forum/${a._id}`)}
                                    />
                                ))}
                            </div>
                        )}

                        <Pagination
                            pageCount={pageCount}
                            handlePageClick={(e) => {
                                const newOffset = (e.selected * ITEMS_PER_PAGE) % posts.length;
                                setOffset(newOffset);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForumPage;
