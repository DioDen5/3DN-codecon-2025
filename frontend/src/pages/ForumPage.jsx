import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listPublished } from "../api/announcements";
import PostCard from "../components/PostCard";
import Pagination from "../components/Pagination";
import SearchInput from "../components/SearchInput";
import { useSort } from "../hooks/useSort.jsx";
import { useForumRefresh } from "../hooks/useForumRefresh";
import {
    toggleAnnouncement,
    countsAnnouncement,
} from "../api/reactions"; // ✅ правильний імпорт
import { useAuthState } from "../api/useAuthState";

const ITEMS_PER_PAGE = 3;

const ForumPage = () => {
    const nav = useNavigate();
    const { isAuthed, user } = useAuthState();
    const { subscribe } = useForumRefresh();

    const [raw, setRaw] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");
    const [q, setQ] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [itemOffset, setItemOffset] = useState(0);
    const [deletingPostId, setDeletingPostId] = useState(null);

    const sortOptions = [
        {
            label: '🕓 Найновіші',
            value: 'newest',
            sort: (a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt),
        },
        {
            label: '🕰️ Найстаріші',
            value: 'oldest',
            sort: (a, b) => new Date(a.publishedAt || a.createdAt) - new Date(b.publishedAt || b.createdAt),
        },
        {
            label: '🤍 За лайками',
            value: 'likes',
            sort: (a, b) => (b.counts?.likes || 0) - (a.counts?.likes || 0),
        },
        {
            label: '💬 За коментарями',
            value: 'comments',
            sort: (a, b) => (b.metrics?.comments || 0) - (a.metrics?.comments || 0),
        },
    ];

    const { sortedData, SortDropdown, sortOption } = useSort(raw, sortOptions);

    const currentItems = useMemo(
        () => sortedData.slice(itemOffset, itemOffset + ITEMS_PER_PAGE),
        [sortedData, itemOffset]
    );
    const pageCount = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
    const currentPage = Math.floor(itemOffset / ITEMS_PER_PAGE);

    const formatDate = (dateString) => {
        if (!dateString) return 'Невідомо';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Невідомо';
        
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays < 1) {
            if (diffHours < 1) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                return diffMinutes < 1 ? 'щойно' : `${diffMinutes}хв`;
            }
            return `${diffHours}г`;
        }
        
        return date.toLocaleDateString('uk-UA');
    };

    const getAuthorName = (announcement) => {
        if (announcement?.authorId) {
            if (announcement.authorId.displayName) {
                return announcement.authorId.displayName;
            }
            if (announcement.authorId.email) {
                return announcement.authorId.email.split('@')[0];
            }
        }
        return 'Невідомий';
    };

    const isOwnPost = (post) => {
        if (!user || !post) return false;
        const userId = user._id || user.id;
        
        if (post?.authorId) {
            if (typeof post.authorId === 'string') {
                return post.authorId === userId;
            }
            if (post.authorId._id) {
                return post.authorId._id === userId;
            }
        }
        
        return false;
    };

    const highlightText = (text, query) => {
        if (!query || !text) return text;
        
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => 
            regex.test(part) ? (
                <mark 
                    key={index} 
                    className="bg-yellow-300 text-black px-1 rounded font-semibold animate-pulse"
                >
                    {part}
                </mark>
            ) : part
        );
    };

    const loadData = async () => {
        setLoading(true);
        setSearching(searchQuery.length > 0);
        setError("");

        try {
            const arr = await listPublished({ q: searchQuery });
            const withCounts = await Promise.all(
                arr.map(async (a) => {
                    try {
                        const counts = await countsAnnouncement(a._id);
                        return { ...a, counts, _my: counts.userReaction || 0 };
                    } catch {
                        return { ...a, counts: { likes: 0, dislikes: 0, score: 0 }, _my: 0 };
                    }
                })
            );
            setRaw(withCounts);
        } catch (err) {
            setError("Помилка завантаження обговорень");
            console.error("Load error:", err);
        } finally {
            setLoading(false);
            setSearching(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(q.trim());
        }, 300);
        
        return () => clearTimeout(timer);
    }, [q]);

    useEffect(() => {
        loadData();
    }, [searchQuery, isAuthed]);

    useEffect(() => {
        const unsubscribe = subscribe(() => {
            loadData();
        });
        return unsubscribe;
    }, [subscribe]);


    const handleVote = async (id, type) => {
        const value = type === "like" ? 1 : -1;
        setRaw((prev) =>
            prev.map((p) => {
                if (p._id !== id) return p;
                const next = { ...p };
                if (!next._my) next._my = 0;
                const newVal = next._my === value ? 0 : value;
                const likes =
                    (next.counts?.likes || 0) +
                    (newVal === 1 ? 1 : 0) -
                    (next._my === 1 ? 1 : 0);
                const dislikes =
                    (next.counts?.dislikes || 0) +
                    (newVal === -1 ? 1 : 0) -
                    (next._my === -1 ? 1 : 0);
                next._my = newVal;
                next.counts = { likes, dislikes, score: likes - dislikes };
                return next;
            })
        );
        try {
            const counts = await toggleAnnouncement(id, value);
            setRaw((prev) => prev.map((p) => (p._id === id ? { ...p, counts, _my: counts.userReaction || 0 } : p)));
        } catch {
            listPublished({ q }).then(setRaw).catch(() => {});
        }
    };

    const handleDelete = (postId) => {
        setDeletingPostId(postId);
        
        // Анімація видалення - зсув вправо
        setTimeout(() => {
            setRaw((prev) => prev.filter((p) => p._id !== postId));
            setDeletingPostId(null);
        }, 600); // Тривалість анімації
    };

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 px-6 py-10 text-white">
            <div className="max-w-4xl mx-auto relative z-10">
                <h1 className="text-center text-3xl font-semibold mb-8">ОБГОВОРЕННЯ</h1>

                <div className="max-w-xl mx-auto mb-4">
                    <SearchInput value={q} onChange={(e) => setQ(e.target.value)} />
                </div>

                <div className="flex justify-between items-center mb-6">
                    <SortDropdown />
                    <button
                        onClick={() => nav("/forum/create")}
                        className="px-4 py-2 bg-white/10 text-white hover:bg-white hover:text-black btn-glow"
                    >
                        + Створити
                    </button>
                </div>

                {loading && <p className="text-center">Завантаження...</p>}
                {searching && <p className="text-center text-blue-400">Пошук...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!loading && !error && (
                    <div>
                        <div className="space-y-4">
                            {currentItems.map((post) => (
                                <PostCard
                                    key={post._id}
                                    id={post._id}
                                    title={post.title}
                                    content={post.body}
                                    image_url={null}
                                    likes={post.counts?.likes ?? 0}
                                    dislikes={post.counts?.dislikes ?? 0}
                                    comments={post.metrics?.comments ?? 0}
                                    username={getAuthorName(post)}
                                    date={formatDate(post.publishedAt || post.createdAt)}
                                    voted={post._my === 1 ? 'like' : post._my === -1 ? 'dislike' : (post.counts?.userReaction === 1 ? 'like' : post.counts?.userReaction === -1 ? 'dislike' : null)}
                                    onVote={(id, t) => handleVote(id, t)}
                                    onClick={() => nav(`/forum/${post._id}`)}
                                    searchQuery={searchQuery}
                                    isOwnPost={isOwnPost(post)}
                                    onDelete={handleDelete}
                                    isDeletingPost={deletingPostId === post._id}
                                />
                            ))}
                        </div>

                        {sortedData.length >= 4 && (
                            <Pagination
                                pageCount={pageCount}
                                currentPage={currentPage}
                                handlePageClick={(e) => {
                                    const newOffset =
                                        (e.selected * ITEMS_PER_PAGE) % sortedData.length;
                                    setItemOffset(newOffset);
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForumPage;
