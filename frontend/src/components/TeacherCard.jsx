import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react'

const TeacherCard = ({ id, image, name, university, rating, likes, dislikes, comments }) => {
    const navigate = useNavigate()

    return (
        <div
            onClick={() => navigate(`/teachers/${id}`)}
            className="bg-white text-black rounded-xl overflow-hidden shadow-md w-full max-w-xs cursor-pointer hover:scale-[1.02] transition"
        >
            <img src={image} alt={name} className="w-full h-64 object-cover" />
            <div className="p-4">
                <h3 className="text-sm font-medium leading-tight mb-1">{name}</h3>
                <p className="text-sm text-gray-600 mb-2">{university}</p>
                <p className="text-sm">
                    Заг. оцінка:{' '}
                    <span className="text-blue-600 font-semibold">{rating}/10</span>
                </p>
                <div className="flex items-center gap-2 text-sm mt-3">
                    <div className="flex items-center gap-1"><ThumbsUp size={14} /> {likes}</div>
                    <div className="flex items-center gap-1"><ThumbsDown size={14} /> {dislikes}</div>
                    <div className="flex items-center gap-1"><MessageCircle size={14} /> {comments}</div>
                </div>
            </div>
        </div>
    )
}

export default TeacherCard
