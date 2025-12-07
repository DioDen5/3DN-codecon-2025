import React from 'react';
import { FileText, MessageSquare, MessageCircle, Star, UserRound, GraduationCap } from 'lucide-react';
import SearchInput from '../SearchInput';

const ModerationFilters = ({ 
    moderationFilter, 
    setModerationFilter, 
    moderationSearch, 
    setModerationSearch,
    selectedItems,
    handleBulkDelete
}) => {
    const moderationFilters = [
        { id: 'all', label: 'Весь контент', icon: FileText },
        { id: 'announcements', label: 'Обговорення', icon: MessageSquare },
        { id: 'comments', label: 'Коментарі', icon: MessageCircle },
        { id: 'reviews', label: 'Відгуки', icon: Star },
        { id: 'name-requests', label: 'Зміна імені', icon: UserRound },
        { id: 'teacher-verification', label: 'Верифікація викладачів', icon: GraduationCap },
        { id: 'teacher-changes', label: 'Редагування профілів', icon: GraduationCap }
    ];

    return (
        <div className="bg-white rounded-2xl px-6 py-4 shadow-xl border border-gray-200" style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}>
            <div className="flex flex-col lg:flex-row gap-4 mb-3">
                <div className="flex flex-wrap gap-2">
                    {moderationFilters.map((filter) => {
                        const Icon = filter.icon;
                        return (
                            <button
                                key={filter.id}
                                onClick={() => {
                                    setModerationFilter(filter.id);
                                    localStorage.setItem('adminModerationFilter', filter.id);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
                                    moderationFilter === filter.id
                                        ? filter.id === 'all' 
                                            ? 'bg-blue-800 text-white shadow-lg transform scale-105'
                                            : filter.id === 'announcements'
                                            ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                                            : filter.id === 'comments'
                                            ? 'bg-green-500 text-white shadow-lg transform scale-105'
                                            : filter.id === 'reviews'
                                            ? 'bg-purple-500 text-white shadow-lg transform scale-105'
                                            : filter.id === 'name-requests'
                                            ? 'bg-blue-400 text-white shadow-lg transform scale-105'
                                            : filter.id === 'teacher-changes'
                                            ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                                            : filter.id === 'teacher-verification'
                                            ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                            : 'bg-blue-500 text-white shadow-lg transform scale-105'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                }`}
                            >
                                <Icon size={16} />
                                <span className="font-medium">{filter.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1 lg:flex-none lg:w-[370px]">
                    <SearchInput 
                        placeholder="Пошук по тексту..."
                        value={moderationSearch}
                        onChange={(e) => setModerationSearch(e.target.value)}
                        whiteTheme={true}
                    />
                </div>
            </div>

            {selectedItems.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 moderation-pulse">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {selectedItems.length}
                            </div>
                            <span className="font-medium text-yellow-800">
                                Вибрано {selectedItems.length} елементів
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleBulkDelete(moderationFilter)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                            >
                                Видалити вибрані
                            </button>
                            <button
                                onClick={() => setSelectedItems([])}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                            >
                                Скасувати
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModerationFilters;
