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
            setTeacher(data)
            setCurrentRating(data.rating)
            
            // Не завантажуємо userReaction з сервера, оскільки тепер зберігаємо локально
            
            // Fetch comments for the teacher
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
            
            // Перевіряємо, чи користувач вже залишив відгук
            if (isAuthenticated && user) {
                const userId = user._id || user.id
                const userHasReview = commentsWithCounts.some(comment => 
                    comment.authorId && comment.authorId._id === userId
                )
                setHasSubmittedReview(userHasReview)
                
                // Якщо користувач вже залишив відгук, завантажуємо його оцінку з коментаря
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
            // Спочатку відправляємо оцінку на сервер
            const voteData = await voteTeacher(id, rating >= 3 ? 'like' : 'dislike')
            console.log('Vote response:', voteData)
            
            // Оновлюємо дані викладача з сервера
            setTeacher(voteData.teacher)
            setCurrentRating(voteData.teacher.rating)
            
            // Потім створюємо коментар з оцінкою
            const newComment = await createTeacherComment(id, commentText, rating)
            setReplies(prev => [newComment, ...prev])
            
            // Показуємо оцінку в блоці "Ваша оцінка"
            setHasSubmittedReview(true)
            setUserRating(rating)
        } catch (err) {
            console.error('Error creating review:', err)
            // You could add error handling here
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
                            <div className="flex items-start justify-between mb-6">
                                <div>
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
                                
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-blue-500 mb-2 flex items-center">
                                        <div className="relative overflow-hidden inline-block">
                                            <div 
                                                key={currentRating}
                                                className="transition-all duration-500 ease-out"
                                                style={{
                                                    animation: 'ratingSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                                                }}
                                            >
                                                {currentRating.toFixed(1)}
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
                                    <p className="text-sm text-gray-500">Загальна оцінка</p>
                                    <style jsx>{`
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
                            </div>

                            <div className="grid grid-cols-3 gap-6 mb-8">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{teacher.likes}</div>
                                    <p className="text-sm text-gray-600">Позитивні</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{teacher.dislikes}</div>
                                    <p className="text-sm text-gray-600">Негативні</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{teacher.comments}</div>
                                    <p className="text-sm text-gray-600">Відгуки</p>
                                </div>
                            </div>

                            {isAuthenticated && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4">Ваша оцінка</h3>
                                    <div className="flex items-center gap-4">
                                        {!hasSubmittedReview ? (
                                            <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-100 text-gray-500">
                                                <span>Оберіть оцінку</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 px-6 py-4 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                                                <span className="text-lg">⭐</span>
                                                <span className="text-sm font-semibold">
                                                    {userRating} з 5 зірок
                                                </span>
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
                        <TeacherRepliesList replies={replies} onRepliesUpdate={setReplies} />
            </div>
        </div>
    )
}

export default TeacherProfilePage