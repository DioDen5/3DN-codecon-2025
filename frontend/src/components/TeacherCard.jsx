import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import StarRating from './StarRating'

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

    const handleCardClick = () => {
        navigate(`/teachers/${_id}`)
    }

    return (
        <div 
            className="bg-white text-black rounded-xl overflow-hidden shadow-md w-full max-w-xs cursor-pointer hover:-translate-y-3 hover:shadow-xl transition-all duration-500 ease-in-out border-0"
            onClick={handleCardClick}
        >
            {image && image !== '/api/placeholder/300/400' && image.trim() !== '' ? (
                <img 
                    src={image} 
                    alt={name} 
                    className="w-full h-64 object-cover object-[center_20%] pointer-events-none" 
                    onError={(e) => {
                        // При помилці завантаження показуємо placeholder з ініціалами
                        e.target.style.display = 'none';
                        const placeholder = e.target.nextElementSibling;
                        if (placeholder) placeholder.style.display = 'flex';
                    }}
                />
            ) : (
                <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold pointer-events-none">
                    {name?.charAt(0)?.toUpperCase() || 'T'}
                </div>
            )}
            <div className="p-3">
                <h3 className="text-sm font-medium leading-tight mb-1">
                    {highlightText ? highlightText(name, searchQuery) : name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                    {highlightText ? highlightText(university, searchQuery) : university}
                </p>
                <p className="text-sm mb-1">
                    Заг. оцінка:{' '}
                    <span className="text-blue-600 font-semibold">
                        {rating}/10
                    </span>
                </p>
                <div className="flex items-center gap-3 text-sm">
                    <StarRating 
                        rating={rating} 
                        maxRating={10} 
                        size="sm" 
                        showNumber={false}
                        animated={false}
                    />
                    <div className="flex items-center gap-1 text-gray-600">
                        <MessageCircle size={14} /> {comments}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TeacherCard