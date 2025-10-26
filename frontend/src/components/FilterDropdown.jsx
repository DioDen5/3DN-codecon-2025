import React, { useState, useRef, useEffect } from 'react';
import { X, Check, GraduationCap, Building2, BookMarked } from 'lucide-react';

const FilterDropdown = ({ 
    filters = {}, 
    onFiltersChange, 
    onToggle,
    className = '',
    position = 'right-0'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);
    const [filtersApplied, setFiltersApplied] = useState(false);
    const dropdownRef = useRef(null);

    const filterOptions = {
        university: [
            { value: '', label: 'Всі університети' },
            { value: 'Львівська політехніка', label: 'Львівська політехніка' },
            { value: 'ЛНУ ім. І. Франка', label: 'ЛНУ ім. І. Франка' },
            { value: 'УКУ', label: 'УКУ' },
            { value: 'Львівська комерційна академія', label: 'Львівська комерційна академія' }
        ],
        department: [
            { value: '', label: 'Всі кафедри' },
            { value: 'Інформаційних систем', label: 'Інформаційних систем' },
            { value: 'Комп\'ютерних наук', label: 'Комп\'ютерних наук' },
            { value: 'Математики', label: 'Математики' },
            { value: 'Фізики', label: 'Фізики' },
            { value: 'Хімії', label: 'Хімії' }
        ],
        subject: [
            { value: '', label: 'Всі предмети' },
            { value: 'Програмування', label: 'Програмування' },
            { value: 'Математика', label: 'Математика' },
            { value: 'Фізика', label: 'Фізика' },
            { value: 'Хімія', label: 'Хімія' },
            { value: 'Інформатика', label: 'Інформатика' },
            { value: 'Алгоритми', label: 'Алгоритми' },
            { value: 'Бази даних', label: 'Бази даних' }
        ]
    };

    // Removed click outside handler to prevent auto-closing
    // useEffect(() => {
    //     const handleClickOutside = (event) => {
    //         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
    //             handleClose();
    //         }
    //     };

    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => document.removeEventListener('mousedown', handleClickOutside);
    // }, []);

    // Видаляємо цей useEffect, оскільки тепер логіка анімації в handleOpen

    const handleFilterChange = (filterType, value) => {
        const newFilters = { ...localFilters, [filterType]: value };
        setLocalFilters(newFilters);
    };

    const handleOpen = () => {
        setIsOpen(true);
        onToggle?.(true);
        // Невелика затримка для того, щоб DOM оновився перед анімацією
        setTimeout(() => {
            setIsAnimating(true);
        }, 10);
    };

    const handleClose = () => {
        setIsAnimating(false);
        onToggle?.(false);
        setTimeout(() => {
            setIsOpen(false);
        }, 300);
    };

    const handleApplyFilters = () => {
        onFiltersChange(localFilters);
        setFiltersApplied(true);
        handleClose();
    };

    const handleClearFilters = () => {
        const clearedFilters = Object.keys(localFilters).reduce((acc, key) => {
            acc[key] = '';
            return acc;
        }, {});
        setLocalFilters(clearedFilters);
        onFiltersChange(clearedFilters);
        setFiltersApplied(false);
        handleClose();
    };

    const hasActiveFilters = Object.values(localFilters).some(value => value !== '');

    const [hovered, setHovered] = useState(false);
    const showGlow = isOpen || hovered;

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={isOpen ? handleClose : handleOpen}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={`flex items-center justify-center w-10 h-10 border border-white/20 rounded cursor-pointer 
                    transition-all duration-500 ease-in-out
                    ${showGlow
                        ? 'shadow-[0_0_140px_22px_rgba(255,255,255,0.3)]'
                        : 'shadow-[0_0_140px_22px_rgba(255,255,255,0)]'}
                    ${isOpen
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white hover:bg-white hover:text-black'}
                `}
            >
                <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="1.5" rx="0.75" />
                    <circle cx="4" cy="3.75" r="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="2" y="7" width="12" height="1.5" rx="0.75" />
                    <circle cx="8" cy="7.75" r="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="2" y="11" width="12" height="1.5" rx="0.75" />
                    <circle cx="12" cy="11.75" r="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                    {(hasActiveFilters || filtersApplied) && (
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                            filtersApplied 
                                ? 'bg-green-500' 
                                : 'bg-red-500 animate-pulse'
                        }`}></div>
                    )}
            </button>

                {isOpen && (
                    <div className="absolute z-50 flex justify-center" style={{
                        // TODO: Refactor this temporary positioning hack
                        // This is a workaround for specific positioning requirements
                        top: '60%',
                        left: '737.5%', // Temporary extreme value for positioning
                        transform: 'translateX(-50%)',
                        width: '100vw',
                        marginTop: '2rem'
                    }}>
                    <div className="w-full max-w-6xl mx-6">
                        <div className={`bg-gradient-to-b from-black to-gray-900 rounded-3xl shadow-2xl border border-gray-700 transform transition-all duration-500 ease-out ${
                            isAnimating 
                                ? 'translate-y-0 opacity-100 scale-100' 
                                : '-translate-y-12 opacity-0 scale-90'
                        }`}>
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-white">
                                        Фільтрація викладачів
                                    </h3>
                                    <button
                                        onClick={handleClose}
                                        className="p-2 rounded-full bg-gray-900 hover:bg-gray-700 transition-all duration-300 group transform hover:scale-110 active:scale-95 cursor-pointer"
                                    >
                                        <X 
                                            className="w-6 h-6 text-gray-400 group-hover:text-white transition-all duration-300" 
                                            style={{ transform: 'rotate(0deg)' }}
                                            onMouseEnter={(e) => e.target.style.transform = 'rotate(90deg)'}
                                            onMouseLeave={(e) => e.target.style.transform = 'rotate(0deg)'}
                                        />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {Object.entries(filterOptions).map(([filterType, options], index) => (
                                        <div 
                                            key={filterType}
                                            className="animate-in slide-in-from-left-2 fade-in-0"
                                            style={{ animationDelay: `${index * 150}ms` }}
                                        >
                                            <label className="flex items-center gap-3 text-lg font-semibold text-gray-200 mb-4 capitalize">
                                                {filterType === 'university' && (
                                                    <>
                                                        <GraduationCap className="w-6 h-6 text-blue-400" />
                                                        Університет
                                                    </>
                                                )}
                                                {filterType === 'department' && (
                                                    <>
                                                        <Building2 className="w-6 h-6 text-green-400" />
                                                        Кафедра
                                                    </>
                                                )}
                                                {filterType === 'subject' && (
                                                    <>
                                                        <BookMarked className="w-6 h-6 text-purple-400" />
                                                        Предмет
                                                    </>
                                                )}
                                            </label>
                                            <select
                                                value={localFilters[filterType] || ''}
                                                onChange={(e) => handleFilterChange(filterType, e.target.value)}
                                                className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-1 transition-all duration-300 text-white hover:bg-gray-600 hover:border-gray-500 text-lg focus:outline-none pr-8 cursor-pointer ${
                                                    filterType === 'university' 
                                                        ? 'focus:ring-blue-400 focus:border-blue-400 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                                        : filterType === 'department'
                                                        ? 'focus:ring-green-400 focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                                                        : 'focus:ring-purple-400 focus:border-purple-400 focus:shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                                                }`}
                                                style={{ 
                                                    outline: 'none',
                                                    appearance: 'none',
                                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                                    backgroundPosition: 'right 0.5rem center',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundSize: '1.5em 1.5em',
                                                    transition: 'background-image 0.3s ease-in-out'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.backgroundImage = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M14 12l-4-4-4 4'/%3e%3c/svg%3e")`;
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.backgroundImage = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;
                                                }}
                                            >
                                                {options.map((option) => (
                                                    <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700 animate-in slide-in-from-bottom-2 fade-in-0">
                                        <button
                                            onClick={handleApplyFilters}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-3 font-semibold text-lg shadow-xl hover:shadow-2xl cursor-pointer"
                                        >
                                        <Check className="w-5 h-5" />
                                        Застосувати фільтри
                                    </button>
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-6 py-4 border-2 border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 hover:border-gray-500 transition-all duration-300 font-semibold text-lg hover:scale-105 cursor-pointer"
                                    >
                                        Очистити
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
