import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ThumbsUp, ThumbsDown, Star, GraduationCap, BookOpen } from 'lucide-react'
import { getTeacher, voteTeacher, getTeacherReactions } from '../api/teachers'
import { useAuthState } from '../api/useAuthState'
import CommentInput from '../components/CommentInput'
import RepliesList from '../components/RepliesList'

const TeacherProfilePage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthed: isAuthenticated } = useAuthState()
    
    const [teacher, setTeacher] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [userReaction, setUserReaction] = useState(0)
    const [isVoting, setIsVoting] = useState(false)
    const [currentRating, setCurrentRating] = useState(0)
    const [replies, setReplies] = useState([])

    const loadTeacher = async () => {
        setLoading(true)
        setError('')
        try {
            const data = await getTeacher(id)
            setTeacher(data)
            setCurrentRating(data.rating)
            
            if (isAuthenticated) {
                const reactionData = await getTeacherReactions(id)
                setUserReaction(reactionData.userReaction)
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

    const handleVote = async (type) => {
        console.log('Voting:', type, 'isAuthenticated:', isAuthenticated)
        
        if (!isAuthenticated) {
            console.log('Not authenticated, redirecting to login')
            navigate('/login')
            return
        }

        setIsVoting(true)
        try {
            console.log('Sending vote request...')
            const data = await voteTeacher(id, type)
            console.log('Vote response:', data)
            setTeacher(data.teacher)
            setUserReaction(data.userReaction)
            
            animateRatingChange(data.teacher.rating)
        } catch (err) {
            console.error('Error voting:', err)
            console.error('Error details:', err.response?.data)
        } finally {
            setIsVoting(false)
        }
    }

    const animateRatingChange = (newRating) => {
        const startRating = currentRating
        const difference = newRating - startRating
        const steps = 20
        const stepSize = difference / steps
        let currentStep = 0

        const interval = setInterval(() => {
            currentStep++
            const newValue = startRating + (stepSize * currentStep)
            setCurrentRating(Math.round(newValue * 10) / 10)
            
            if (currentStep >= steps) {
                setCurrentRating(newRating)
                clearInterval(interval)
            }
        }, 50)
    }

    const handleCommentSubmit = async (commentText) => {
        console.log('Comment submitted:', commentText)
        const newComment = {
            _id: Date.now().toString(),
            body: commentText,
            authorId: {
                _id: 'current-user',
                displayName: 'Current User',
                email: 'user@example.com'
            },
            createdAt: new Date().toISOString(),
            counts: {
                likes: 0,
                dislikes: 0,
                userReaction: 0
            }
        }
        setReplies(prev => [...prev, newComment])
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
                                    <div className="text-4xl font-bold text-blue-600 mb-1">
                                        {currentRating}/10
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={20} 
                                                className={i < Math.floor(currentRating / 2) ? 'fill-current' : 'text-gray-300'} 
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Загальна оцінка</p>
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
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleVote('like')}
                                            disabled={isVoting}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                                                userReaction === 1 
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-gray-100 hover:bg-green-100 text-gray-700'
                                            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <ThumbsUp size={20} />
                                            Позитивна
                                        </button>
                                        
                                        <button
                                            onClick={() => handleVote('dislike')}
                                            disabled={isVoting}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                                                userReaction === -1 
                                                    ? 'bg-red-500 text-white' 
                                                    : 'bg-gray-100 hover:bg-red-100 text-gray-700'
                                            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <ThumbsDown size={20} />
                                            Негативна
                                        </button>
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
                <CommentInput onSubmit={handleCommentSubmit} />
                <RepliesList replies={replies} />
            </div>
        </div>
    )
}

export default TeacherProfilePage