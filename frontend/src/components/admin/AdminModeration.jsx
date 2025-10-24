import React from 'react';
import { FileText, MessageSquare, MessageCircle, Star, Search, Trash2, CheckCircle } from 'lucide-react';

const AdminModeration = ({
    moderationFilter,
    setModerationFilter,
    moderationSearch,
    setModerationSearch,
    selectedItems,
    setSelectedItems,
    moderationData,
    allModerationContent,
    moderationPagination,
    handleModerationPrevPage,
    handleModerationNextPage,
    handleModerationPageClick,
    handleBulkDelete,
    handleDeleteItem
}) => {
    const moderationFilters = [
        { id: 'all', label: 'Весь контент', icon: FileText },
        { id: 'announcements', label: 'Обговорення', icon: MessageSquare },
        { id: 'comments', label: 'Коментарі', icon: MessageCircle },
        { id: 'reviews', label: 'Відгуки', icon: Star }
    ];

    return (
        <div className="space-y-6">
            {/* Заголовок та статистика */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 moderation-slide-in">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Модерація контенту</h3>
                        <p className="text-gray-600">Управління якістю контенту на платформі</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{moderationData?.announcements || 0}</div>
                            <div className="text-sm text-gray-600">Обговорень</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{moderationData?.comments || 0}</div>
                            <div className="text-sm text-gray-600">Коментарів</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{moderationData?.reviews || 0}</div>
                            <div className="text-sm text-gray-600">Відгуків</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Фільтри та пошук */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 moderation-slide-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    {/* Фільтри */}
                    <div className="flex flex-wrap gap-2">
                        {moderationFilters.map((filter) => {
                            const Icon = filter.icon;
                            return (
                                <button
                                    key={filter.id}
                                    onClick={() => setModerationFilter(filter.id)}
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

                    {/* Пошук */}
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Пошук по тексту..."
                                value={moderationSearch}
                                onChange={(e) => setModerationSearch(e.target.value)}
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <Search className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Масові дії */}
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
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Видалити вибрані
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Контент */}
                {moderationFilter === 'all' && (
                    <div className="space-y-3">
                        {allModerationContent?.length > 0 ? (
                            allModerationContent.map((item, index) => (
                                <div
                                    key={item._id}
                                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                                    item.contentType === 'announcement' ? 'bg-blue-500' :
                                                    item.contentType === 'comment' ? 'bg-green-500' :
                                                    'bg-purple-500'
                                                }`}>
                                                    {item.authorId?.displayName?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {item.contentType === 'announcement' ? item.title :
                                                         item.contentType === 'comment' ? 'Коментар' :
                                                         'Відгук про викладача'}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Автор: {item.authorId?.displayName || 'Невідомий'} • {new Date(item.createdAt).toLocaleDateString('uk-UA')}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 mb-3">
                                                {item.contentType === 'announcement' ? item.body?.substring(0, 100) + '...' :
                                                 item.contentType === 'comment' ? item.body?.substring(0, 150) + '...' :
                                                 item.body?.substring(0, 150) + '...'}
                                            </p>
                                            {item.contentType === 'review' && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex">
                                                        {[1,2,3,4,5].map((star) => (
                                                            <Star key={star} className={`w-4 h-4 ${star <= item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-gray-600">{item.rating}/5</span>
                                                    <span className="text-sm text-gray-500">• {item.teacherId?.name || 'Викладач'}</span>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors cursor-pointer">
                                                    Схваліти
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteItem(item._id, item.contentType)}
                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors cursor-pointer"
                                                >
                                                    Видалити
                                                </button>
                                                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors cursor-pointer">
                                                    Переглянути
                                                </button>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            checked={selectedItems.includes(item._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedItems([...selectedItems, item._id]);
                                                } else {
                                                    setSelectedItems(selectedItems.filter(id => id !== item._id));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-10 h-10 text-white" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Весь контент</h4>
                                <p className="text-gray-600">Немає контенту для модерації</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Пагінація для "Весь контент" */}
                {moderationFilter === 'all' && allModerationContent?.length > 0 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={handleModerationPrevPage}
                            disabled={!moderationPagination?.hasPrevPage}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 transform cursor-pointer ${
                                moderationPagination?.hasPrevPage
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Попередня
                        </button>

                        <div className="flex items-center gap-2">
                            {(() => {
                                const currentPage = moderationPagination?.currentPage || 1;
                                const totalPages = moderationPagination?.totalPages || 1;
                                const maxVisible = 5;
                                
                                let startPage, endPage;
                                
                                if (totalPages <= maxVisible) {
                                    startPage = 1;
                                    endPage = totalPages;
                                } else {
                                    const halfVisible = Math.floor(maxVisible / 2);
                                    
                                    if (currentPage <= halfVisible) {
                                        startPage = 1;
                                        endPage = maxVisible;
                                    } else if (currentPage + halfVisible >= totalPages) {
                                        startPage = totalPages - maxVisible + 1;
                                        endPage = totalPages;
                                    } else {
                                        startPage = currentPage - halfVisible;
                                        endPage = currentPage + halfVisible;
                                    }
                                }
                                
                                const pages = [];
                                
                                if (startPage > 1) {
                                    pages.push(
                                        <button
                                            key={1}
                                            onClick={() => handleModerationPageClick(1)}
                                            className="w-10 h-10 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 hover:scale-105 hover:shadow-md hover:shadow-blue-200/50 transition-all duration-500 cursor-pointer"
                                        >
                                            1
                                        </button>
                                    );
                                    
                                    if (startPage > 2) {
                                        pages.push(
                                            <span key="ellipsis1" className="text-gray-400 font-medium">⋯</span>
                                        );
                                    }
                                }
                                
                                for (let i = startPage; i <= endPage; i++) {
                                    const isActive = i === currentPage;
                                    pages.push(
                                        <button
                                            key={i}
                                            onClick={() => handleModerationPageClick(i)}
                                            className={`relative w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-500 transform cursor-pointer ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 hover:scale-105 hover:shadow-md hover:shadow-blue-200/50'
                                            }`}
                                        >
                                            {isActive && (
                                                <>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl animate-pulse opacity-30"></div>
                                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce"></div>
                                                </>
                                            )}
                                            <span className="relative z-10">{i}</span>
                                        </button>
                                    );
                                }
                                
                                if (endPage < totalPages) {
                                    if (endPage < totalPages - 1) {
                                        pages.push(
                                            <span key="ellipsis2" className="text-gray-400 font-medium">⋯</span>
                                        );
                                    }
                                    
                                    pages.push(
                                        <button
                                            key={totalPages}
                                            onClick={() => handleModerationPageClick(totalPages)}
                                            className="w-10 h-10 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 hover:scale-105 hover:shadow-md hover:shadow-blue-200/50 transition-all duration-500 cursor-pointer"
                                        >
                                            {totalPages}
                                        </button>
                                    );
                                }
                                
                                return pages;
                            })()}
                        </div>

                        <button
                            onClick={handleModerationNextPage}
                            disabled={!moderationPagination?.hasNextPage}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 transform cursor-pointer ${
                                moderationPagination?.hasNextPage
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Наступна
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminModeration;