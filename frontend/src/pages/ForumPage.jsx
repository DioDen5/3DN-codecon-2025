import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { articleList, voteArticle } from '../api/article_comment'
import PostCard from '../components/PostCard'
import Pagination from '../components/Pagination'
import SearchInput from '../components/SearchInput'
import { useSort } from '../hooks/./useSort.jsx'

const itemsPerPage = 3

const ForumPage = () => {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [itemOffset, setItemOffset] = useState(0)
    const navigate = useNavigate()

    const { sortedData, SortDropdown } = useSort(posts)

    const currentItems = sortedData.slice(itemOffset, itemOffset + itemsPerPage)
    const pageCount = Math.ceil(sortedData.length / itemsPerPage)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await articleList()
                const postsWithVotes = data.map(post => ({ ...post, voted: null }))
                setPosts(postsWithVotes)
            } catch (err) {
                setError(err?.response?.data?.error || err.message || 'Failed to load')
            } finally {
                setLoading(false)
            }
        }
        fetchPosts()
    }, [])

    const handleVote = async (postId, type) => {
        // оптимістичне оновлення — верстку не чіпаємо
        setPosts(prev =>
            prev.map(post => {
                if (post.id !== postId) return post
                let updated = { ...post }
                if (type === 'like' && post.voted !== 'like') {
                    updated.rating_positive += 1
                    if (post.voted === 'dislike') updated.rating_negative -= 1
                    updated.voted = 'like'
                } else if (type === 'dislike' && post.voted !== 'dislike') {
                    updated.rating_negative += 1
                    if (post.voted === 'like') updated.rating_positive -= 1
                    updated.voted = 'dislike'
                }
                return updated
            })
        )
        try { await voteArticle(postId, type) } catch {}
    }

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 px-6 py-10 text-white">
            <div className="max-w-4xl mx-auto relative z-10">
                <h1 className="text-center text-3xl font-semibold mb-8 ">ОБГОВОРЕННЯ</h1>

                <div className="max-w-xl mx-auto mb-4">
                    <SearchInput />
                </div>

                <div className="flex justify-between items-center mb-6">
                    <SortDropdown />
                    <button
                        onClick={() => navigate("/forum/create")}
                        className="px-4 py-2 bg-white/10 text-white hover:bg-white hover:text-black btn-glow "
                    >
                        + Створити
                    </button>
                </div>

                {loading && <p className="text-center">Завантаження...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!loading && !error && (
                    <div>
                        <div className="space-y-4">
                            {currentItems.map(post => (
                                <PostCard
                                    key={post.id}
                                    id={post.id}
                                    title={post.title}
                                    content={post.content}
                                    image_url={post.image_url}
                                    likes={post.rating_positive}
                                    dislikes={post.rating_negative}
                                    comments={post.comment_count}
                                    username={`${post.user.first_name} ${post.user.last_name}`}
                                    date={new Date(post.created_at).toLocaleDateString()}
                                    voted={post.voted}
                                    onVote={handleVote}
                                    onClick={() => navigate(`/forum/${post.id}`)}
                                />
                            ))}
                        </div>

                        <Pagination
                            pageCount={pageCount}
                            handlePageClick={(e) => {
                                const newOffset = (e.selected * itemsPerPage) % sortedData.length
                                setItemOffset(newOffset)
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default ForumPage
