import React from 'react';

const StarRating = ({ rating, maxRating = 10, size = 'md', showNumber = true, animated = false }) => {
    // Перевіряємо валідність rating
    const safeRating = isNaN(rating) || rating === null || rating === undefined ? 0 : Number(rating);
    const normalizedRating = Math.max(0, Math.min(5, (safeRating / maxRating) * 5)); // Нормалізуємо до 5 зірок з обмеженнями
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8'
    };

    const StarIcon = ({ filled, half = false, className = '', index = 0 }) => (
        <svg 
            className={`${sizeClasses[size]} ${className} ${animated ? 'transition-all duration-700 ease-out transform hover:scale-105' : ''}`}
            viewBox="0 0 24 24" 
            fill="none"
            style={animated ? { 
                animationDelay: `${index * 150}ms`,
                animation: filled ? 'starGlow 4s ease-in-out infinite, starFill 0.8s ease-out forwards' : 'starFill 0.8s ease-out forwards',
                opacity: filled ? 0 : 0,
                animationFillMode: 'forwards'
            } : {}}
        >
            <defs>
                <linearGradient id={`starGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <filter id={`glow-${index}`}>
                    <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                    <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={filled ? (half ? `url(#starGradient-${index})` : '#60a5fa') : '#000000'}
                stroke={filled ? '#3b82f6' : '#000000'}
                strokeWidth="0.5"
                className={animated && filled ? 'drop-shadow-sm' : 'drop-shadow-sm'}
                filter={animated && filled ? `url(#glow-${index})` : 'none'}
            />
            {half && (
                <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill={`url(#starGradient-${index})`}
                    fillOpacity="0.7"
                />
            )}
        </svg>
    );

    return (
        <div className="flex items-center gap-1">
            <style>{`
                @keyframes starGlow {
                    0% { 
                        filter: drop-shadow(0 0 1px #60a5fa);
                        transform: scale(1);
                        opacity: 0.8;
                    }
                    50% { 
                        filter: drop-shadow(0 0 3px #60a5fa) drop-shadow(0 0 5px #93c5fd);
                        transform: scale(1.02);
                        opacity: 1;
                    }
                    100% { 
                        filter: drop-shadow(0 0 1px #60a5fa);
                        transform: scale(1);
                        opacity: 0.8;
                    }
                }
                @keyframes starFill {
                    0% { 
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    100% { 
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
            <div className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                    <StarIcon 
                        key={`full-${i}`} 
                        filled={true}
                        index={i}
                        className={animated ? 'animate-pulse' : ''}
                    />
                ))}
                {hasHalfStar && (
                    <StarIcon 
                        key="half" 
                        filled={true} 
                        half={true}
                        index={fullStars}
                        className={animated ? 'animate-pulse' : ''}
                    />
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <StarIcon 
                        key={`empty-${i}`} 
                        filled={false}
                        index={fullStars + (hasHalfStar ? 1 : 0) + i}
                    />
                ))}
            </div>
            {showNumber && (
                <span className="ml-2 text-sm font-medium text-gray-600">
                    {safeRating.toFixed(1)}/{maxRating}
                </span>
            )}
        </div>
    );
};

export default StarRating;
