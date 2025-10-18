import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react'
import { voteTeacher, getTeacherReactions } from '../api/teachers'
import { useAuthState } from '../api/useAuthState'

const TeacherCard = ({ 
    _id, 
    image, 
    name, 
    university, 
    rating, 
    likes, 
    dislikes, 
    comments, 
    searchQuery = '',
    highlightText 
}) => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthState()
    const [userReaction, setUserReaction] = useState(0)
    const [isVoting, setIsVoting] = useState(false)
    const [currentRating, setCurrentRating] = useState(rating)

    useEffect(() => {
        if (isAuthenticated) {
            loadUserReaction()
        }
    }, [isAuthenticated, _id])

    const loadUserReaction = async () => {
        try {
            const data = await getTeacherReactions(_id)
            setUserReaction(data.userReaction)
        } catch (error) {
            console.error('Failed to load user reaction:', error)
        }
    }

    const handleVote = async (type, e) => {
        e.stopPropagation()
        
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        if (isVoting) return

        setIsVoting(true)
        
        const previousReaction = userReaction
        const newReaction = type === 'like' ? 1 : -1
        const optimisticReaction = userReaction === newReaction ? 0 : newReaction

        setUserReaction(optimisticReaction)

        try {
            const data = await voteTeacher(_id, type)
            setUserReaction(data.userReaction)
            
            if (data.teacher.rating !== currentRating) {
                animateRatingChange(data.teacher.rating)
            }
        } catch (error) {
            setUserReaction(previousReaction)
            console.error('Failed to vote:', error)
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

    return (
        <div className="bg-white text-black rounded-xl overflow-hidden shadow-md w-full max-w-xs cursor-pointer hover:scale-[1.02] transition">
            <img 
                src={image} 
                alt={name} 
                className="w-full h-64 object-cover object-[center_20%]" 
                onClick={() => navigate(`/teachers/${_id}`)}
            />
            <div className="p-4">
                <h3 className="text-sm font-medium leading-tight mb-1">
                    {highlightText ? highlightText(name, searchQuery) : name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                    {highlightText ? highlightText(university, searchQuery) : university}
                </p>
                <p className="text-sm">
                    Заг. оцінка:{' '}
                    <span className="text-blue-600 font-semibold transition-all duration-300">
                        {currentRating}/10
                    </span>
                </p>
                <div className="flex items-center gap-2 text-sm mt-3">
                    <button
                        onClick={(e) => handleVote('like', e)}
                        disabled={isVoting}
                        className={`flex items-center gap-1 transition-colors ${
                            userReaction === 1 ? 'text-green-600' : 'text-gray-600'
                        } ${isVoting ? 'opacity-50' : ''}`}
                    >
                        <ThumbsUp size={14} /> {likes}
                    </button>
                    <button
                        onClick={(e) => handleVote('dislike', e)}
                        disabled={isVoting}
                        className={`flex items-center gap-1 transition-colors ${
                            userReaction === -1 ? 'text-red-600' : 'text-gray-600'
                        } ${isVoting ? 'opacity-50' : ''}`}
                    >
                        <ThumbsDown size={14} /> {dislikes}
                    </button>
                    <div className="flex items-center gap-1 text-gray-600">
                        <MessageCircle size={14} /> {comments}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TeacherCard
