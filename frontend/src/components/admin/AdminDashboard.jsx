import React from 'react';
import { Users, MessageSquare, Star, Activity, AlertTriangle } from 'lucide-react';

const AdminDashboard = ({ statsData, activityData, activityPagination, handlePrevPage, handleNextPage, handlePageClick, onNavigateToTab }) => {
    const stats = statsData || {};

    return (
        <div className="space-y-6 dashboard-slide-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div 
                    onClick={() => onNavigateToTab('users')}
                    className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300"
                >
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                    <div className="text-xs md:text-sm text-gray-600">Всього користувачів</div>
                </div>
                
                <div 
                    onClick={() => onNavigateToTab('moderation', 'announcements')}
                    className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300"
                >
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{stats.activeAnnouncements}</div>
                    <div className="text-xs md:text-sm text-gray-600">Активних обговорень</div>
                </div>
                
                <div 
                    onClick={() => onNavigateToTab('moderation', 'comments')}
                    className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300"
                >
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{stats.totalComments}</div>
                    <div className="text-xs md:text-sm text-gray-600">Коментарів</div>
                </div>
                
                <div 
                    onClick={() => onNavigateToTab('reports')}
                    className="bg-white text-black rounded-xl p-3 md:p-4 shadow-sm text-center group cursor-pointer hover:scale-105 transition-transform duration-300"
                >
                    <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{stats.pendingReports}</div>
                    <div className="text-xs md:text-sm text-gray-600">Скарг на розгляді</div>
                </div>
            </div>

            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="relative">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 dashboard-users-icon-glow dashboard-users-icon-pulse dashboard-users-icon-rotate dashboard-users-icon-shimmer relative overflow-hidden">
                            <Users className="w-5 h-5 text-white relative z-10" />
                        </div>
                        Розподіл користувачів
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stats.students}</div>
                            <div className="text-sm text-gray-600">Студенти</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stats.teachers}</div>
                            <div className="text-sm text-gray-600">Викладачі</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
                            <div className="text-sm text-gray-600">Адміністратори</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="relative">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 dashboard-activity-icon-glow dashboard-activity-icon-pulse dashboard-activity-icon-rotate dashboard-activity-icon-shimmer relative overflow-hidden">
                            <Activity className="w-5 h-5 text-white relative z-10" />
                        </div>
                        Остання активність
                    </h3>
                    
                    <div className="space-y-3 transition-all duration-500 ease-in-out">
                        {activityData?.slice(0, 4).map((activity, index) => (
                            <div
                                key={activity._id || index}
                                className="bg-gray-300/40 rounded-xl p-4 hover:bg-gray-200/60 transition-all duration-300 cursor-pointer"
                                style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                                            {activity.user?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-700">
                                                {activity.user} • {activity.time}
                                            </div>
                                            <div className="text-sm text-gray-600">{activity.description}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {activityPagination && activityPagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <button
                                onClick={handlePrevPage}
                                disabled={!activityPagination.hasPrevPage}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 transform cursor-pointer ${
                                    activityPagination.hasPrevPage
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
                                    const currentPage = activityPagination.currentPage;
                                    const totalPages = activityPagination.totalPages;
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
                                                onClick={() => handlePageClick(1)}
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
                                                onClick={() => handlePageClick(i)}
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
                                                onClick={() => handlePageClick(totalPages)}
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
                                onClick={handleNextPage}
                                disabled={!activityPagination.hasNextPage}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 transform cursor-pointer ${
                                    activityPagination.hasNextPage
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
        </div>
    );
};

export default AdminDashboard;