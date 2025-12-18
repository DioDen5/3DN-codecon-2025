import React, { useState, useRef } from 'react';
import { Camera, X, Upload } from 'lucide-react';

const ProfilePictureUpload = ({
    currentAvatar,
    userName,
    onImageChange,
    size = 'large',
    className = ''
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const sizeClasses = {
        small: 'w-8 h-8 text-sm',
        medium: 'w-12 h-12 text-base',
        large: 'w-20 h-20 text-2xl',
        xlarge: 'w-24 h-24 text-3xl'
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Розмір файлу не повинен перевищувати 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                alert('Будь ласка, виберіть зображення');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result);
                onImageChange(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setPreview(null);
        onImageChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const isValidImage = currentAvatar &&
        currentAvatar !== '/api/placeholder/300/400' &&
        currentAvatar.trim() !== '';
    const displayImage = preview || (isValidImage ? currentAvatar : null);
    const showInitials = !displayImage;

    return (
        <div className={`relative ${className}`}>
            <div
                className={`${sizeClasses[size]} relative rounded-full cursor-pointer transition-all duration-300 group ${
                    isHovered ? 'scale-105' : 'scale-100'
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleClick}
            >
                {showInitials ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                ) : (
                    <img
                        src={displayImage}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover shadow-lg"
                        onError={(e) => {
                            console.error('Error loading profile image:', displayImage);

                            e.target.style.display = 'none';
                        }}
                    />
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {isHovered && (
                    <div className="absolute inset-0 bg-black bg-opacity-25 rounded-full flex items-center justify-center transition-all duration-300">
                        <div className="text-center">
                            <Camera className="w-6 h-6 text-white mx-auto mb-1" />
                            <span className="text-xs text-white font-medium block">
                                {displayImage ? 'Змінити' : 'Встановити фото'}
                            </span>
                        </div>
                    </div>
                )}

                {displayImage && (
                    <button
                        onClick={handleRemove}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg cursor-pointer"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePictureUpload;
