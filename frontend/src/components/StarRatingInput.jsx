import React, { useState } from 'react';

const StarRatingInput = ({ rating, onRatingChange, disabled = false }) => {
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleStarClick = (starRating) => {
        if (!disabled) {
            onRatingChange(starRating);
        }
    };

    const handleStarHover = (starRating) => {
        if (!disabled) {
            setHoveredRating(starRating);
        }
    };

    const handleMouseLeave = () => {
        if (!disabled) {
            setHoveredRating(0);
        }
    };

    const getStarColor = (starIndex) => {
        const currentRating = hoveredRating || rating;
        if (starIndex <= currentRating) {
            return 'url(#starGradient)'; // Градієнт для активних зірок
        }
        return '#e5e7eb'; // Світло-сірий колір для неактивних зірок
    };

    const getRatingText = (rating) => {
        switch (rating) {
            case 1: return 'Дуже погано';
            case 2: return 'Погано';
            case 3: return 'Нормально';
            case 4: return 'Добре';
            case 5: return 'Відмінно';
            default: return 'Оберіть оцінку';
        }
    };

    const getRatingColor = (rating) => {
        switch (rating) {
            case 1: return 'text-red-600';
            case 2: return 'text-orange-500';
            case 3: return 'text-yellow-500';
            case 4: return 'text-blue-500';
            case 5: return 'text-green-600';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* SVG градієнт визначення */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#1d4ed8" />
                        <stop offset="100%" stopColor="#1e40af" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="flex space-x-2" onMouseLeave={handleMouseLeave}>
                {[1, 2, 3, 4, 5].map((starIndex) => (
                    <button
                        key={starIndex}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleStarClick(starIndex)}
                        onMouseEnter={() => handleStarHover(starIndex)}
                        className={`transition-all duration-300 transform hover:scale-125 active:scale-95 ${
                            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                        }`}
                        style={{
                            filter: (hoveredRating || rating) >= starIndex 
                                ? 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))' 
                                : 'none'
                        }}
                    >
                        <svg
                            className="w-10 h-10"
                            fill={getStarColor(starIndex)}
                            stroke={getStarColor(starIndex)}
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                                transition: 'all 0.3s ease',
                                filter: (hoveredRating || rating) >= starIndex 
                                    ? 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4))' 
                                    : 'none'
                            }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                        </svg>
                    </button>
                ))}
            </div>
            
            <div className="text-center">
                <p className={`text-lg font-semibold transition-colors duration-300 ${getRatingColor(rating)}`}>
                    {getRatingText(rating)}
                </p>
                {rating && (
                    <div className="mt-2 text-center">
                        <span className="text-sm text-gray-600 font-medium">
                            {rating} з 5 зірок
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StarRatingInput;