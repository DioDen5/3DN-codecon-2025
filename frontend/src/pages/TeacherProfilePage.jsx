import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ThumbsUp, ThumbsDown, Star, GraduationCap, BookOpen } from 'lucide-react'
import { getTeacher, voteTeacher, getTeacherReactions } from '../api/teachers'
import { getTeacherComments, createTeacherComment, getTeacherCommentCounts } from '../api/teacher-comments'
import { useAuthState } from '../api/useAuthState'
import ReviewInput from '../components/ReviewInput'
import TeacherRepliesList from '../components/TeacherRepliesList'
import StarRating from '../components/StarRating'

const TeacherProfilePage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthed: isAuthenticated, user } = useAuthState()
    
    const [teacher, setTeacher] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [userRating, setUserRating] = useState(0)
    const [isVoting, setIsVoting] = useState(false)
    const [currentRating, setCurrentRating] = useState(0)
    const [replies, setReplies] = useState([])
    const [hasSubmittedReview, setHasSubmittedReview] = useState(false)

    const loadTeacher = async () => {
        setLoading(true)
        setError('')
        try {
            const data = await getTeacher(id)
            console.log('Loaded teacher data:', {
                comments: data.comments,
                likes: data.likes,
                dislikes: data.dislikes,
                rating: data.rating
            });
            setTeacher(data)
            setCurrentRating(data.rating)
            
            
            const commentsData = await getTeacherComments(id)
            const commentsWithCounts = await Promise.all(
                (commentsData.comments || []).map(async (comment) => {
                    try {
                        const counts = await getTeacherCommentCounts(comment._id)
                        return { ...comment, counts, userReaction: counts.userReaction }
                    } catch (err) {
                        console.error('Error fetching comment counts:', err)
                        return { ...comment, counts: { likes: 0, dislikes: 0, userReaction: 0 } }
                    }
                })
            )
            setReplies(commentsWithCounts)
            
            if (isAuthenticated && user) {
                const userId = user._id || user.id
                const userHasReview = commentsWithCounts.some(comment => 
                    comment.authorId && comment.authorId._id === userId
                )
                setHasSubmittedReview(userHasReview)
                
                if (userHasReview) {
                    const userComment = commentsWithCounts.find(comment => 
                        comment.authorId && comment.authorId._id === userId
                    )
                    if (userComment && userComment.rating) {
                        setUserRating(userComment.rating)
                    }
                }
            }
        } catch (err) {
            setError('Помилка завантаження профілю викладача')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTeacher()
    }, [id, isAuthenticated])

    const handleRatingChange = (rating) => {
        setUserRating(rating)
    }


    const handleReviewSubmit = async (commentText, rating) => {
        console.log('Review submitted:', commentText, 'Rating:', rating)
        
        try {
            console.log('Creating teacher comment with rating:', rating)
            const newComment = await createTeacherComment(id, commentText, rating)
            console.log('Created comment:', newComment)
            setReplies(prev => [newComment, ...prev])
            
            setTimeout(() => {
                const newElement = document.querySelector(`[data-comment-id="${newComment._id}"]`);
                if (newElement) {
                    newElement.classList.add('comment-appearing');
                    setTimeout(() => {
                        newElement.classList.remove('comment-appearing');
                    }, 1710);
                }
            }, 100);
            
            const updatedTeacher = await getTeacher(id)
            console.log('Updated teacher data:', {
                comments: updatedTeacher.comments,
                likes: updatedTeacher.likes,
                dislikes: updatedTeacher.dislikes,
                rating: updatedTeacher.rating
            });
            setTeacher(updatedTeacher)
            setCurrentRating(updatedTeacher.rating)
            
            setHasSubmittedReview(true)
            setUserRating(rating)
        } catch (err) {
            console.error('Error creating review:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Завантаження профілю викладача...</p>
                </div>
            </div>
        )
    }

    if (error || !teacher) {
        return (
            <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'Викладач не знайдений'}</p>
                    <button 
                        onClick={() => navigate('/teachers')}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
                    >
                        Повернутися до списку
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 px-6 py-10 text-white">
            <div className="max-w-4xl mx-auto space-y-6">
                <button
                    onClick={() => navigate('/teachers')}
                    className="text-sm underline text-white hover:text-purple-300 transition"
                >
                    ← Назад до списку
                </button>
                <div className="bg-white text-black rounded-2xl overflow-hidden shadow-2xl">
                    <div className="md:flex">
                        <div className="md:w-1/3">
                    <img
                        src={teacher.image}
                        alt={teacher.name}
                                className="w-full h-80 md:h-full object-cover object-center"
                            />
                        </div>
                        
                        <div className="md:w-2/3 p-8">
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold mb-2">{teacher.name}</h1>
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <GraduationCap size={20} />
                                    <span>{teacher.university}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <BookOpen size={20} />
                                    <span>{teacher.subject}</span>
                                </div>
                            </div>

                            <div className="flex gap-6 mb-8">
                                <div className="text-left">
                                    <p className="text-sm text-gray-500 text-left mb-2">Загальна оцінка</p>
                                    <div className="text-4xl font-bold text-blue-500 mb-2 flex items-center">
                                        <div className="relative overflow-hidden inline-block">
                                            <div 
                                                key={currentRating}
                                                className="transition-all duration-500 ease-out"
                                                style={{
                                                    animation: 'ratingSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                                                }}
                                            >
                                                {Math.round(currentRating)}
                                            </div>
                                        </div>
                                        <span className="ml-1">/10</span>
                                    </div>
                                    <div key={currentRating} className="mb-2">
                                        <StarRating 
                                            rating={currentRating} 
                                            maxRating={10} 
                                            size="lg" 
                                            showNumber={false}
                                            animated={true}
                                        />
                                    </div>
                                </div>
                                <div className="text-center ml-14">
                                    <p className="text-sm text-gray-500 mb-2">Відгуки</p>
                                    <div className="text-4xl font-bold text-blue-600 mb-2">{teacher.comments}</div>
                                </div>
                            </div>

                            {isAuthenticated && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Ваша оцінка</h3>
                                    <div className="flex items-center gap-4">
                                        {!hasSubmittedReview ? (
                                            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                                </svg>
                                                <span className="text-sm font-medium">Оберіть оцінку</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 text-gray-800">
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((starIndex) => (
                                                        <svg 
                                                            key={starIndex}
                                                            className="w-4 h-4"
                                                            viewBox="0 0 24 24" 
                                                            fill="none"
                                                        >
                                                            <defs>
                                                                <linearGradient id={`starGradient-${starIndex}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                                                    <stop offset="0%" stopColor="#60a5fa" />
                                                                    <stop offset="50%" stopColor="#3b82f6" />
                                                                    <stop offset="100%" stopColor="#2563eb" />
                                                                </linearGradient>
                                                                <filter id={`glow-${starIndex}`}>
                                                                    <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                                                                    <feMerge> 
                                                                        <feMergeNode in="coloredBlur"/>
                                                                        <feMergeNode in="SourceGraphic"/>
                                                                    </feMerge>
                                                                </filter>
                                                            </defs>
                                                            <path
                                                                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                                                fill={starIndex <= userRating ? `url(#starGradient-${starIndex})` : '#000000'}
                                                                stroke={starIndex <= userRating ? '#3b82f6' : '#000000'}
                                                                strokeWidth="0.5"
                                                                className="drop-shadow-sm"
                                                                filter={starIndex <= userRating ? `url(#glow-${starIndex})` : 'none'}
                                                            />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {userRating} з 5 зірок
                                                </span>
                                                <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                    ✓ Оцінено
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {!isAuthenticated && (
                                <div className="border-t pt-6">
                                    <p className="text-gray-600 text-center">
                                        <button 
                                            onClick={() => navigate('/login')}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Увійдіть
                                        </button> щоб залишити оцінку
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                        {!hasSubmittedReview && (
                            <ReviewInput 
                                onSubmit={handleReviewSubmit} 
                                userRating={userRating}
                                onRatingChange={handleRatingChange}
                                isVoting={isVoting}
                            />
                        )}
                        <TeacherRepliesList 
                            replies={replies} 
            onRepliesUpdate={(updateFunction) => {
                setReplies(updateFunction);
                
                const newReplies = updateFunction(replies);
                
                if (isAuthenticated && user) {
                    const userId = user._id || user.id;
                    const userHasReview = newReplies.some(comment => 
                        comment.authorId && comment.authorId._id === userId
                    );
                    setHasSubmittedReview(userHasReview);
                    
                    if (!userHasReview) {
                        setUserRating(0);
                    }
                }
            }}
                        />
            </div>
            
            <style>{`
                @keyframes ratingSlideIn {
                    0% {
                        transform: translateY(30px);
                        opacity: 0;
                        filter: blur(2px);
                    }
                    50% {
                        transform: translateY(-5px);
                        opacity: 0.8;
                        filter: blur(0px);
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                        filter: blur(0px);
                    }
                }
            `}</style>
        </div>
    )
}

export default TeacherProfilePage