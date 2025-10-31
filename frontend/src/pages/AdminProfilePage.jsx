import React, { useState, useEffect } from 'react';
import { 
    BarChart3, 
    Users, 
    AlertTriangle, 
    Shield, 
    Settings,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { deleteContent, approveContent, unapproveContent } from '../api/admin-stats';
import { useAuthState } from '../api/useAuthState';
import { useAdminData } from '../hooks/admin/useAdminData';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers';
import AdminReports from '../components/admin/AdminReports';
import AdminModeration from '../components/admin/AdminModeration';
import AdminSettings from '../components/admin/AdminSettings';
import ReportReviewModal from '../components/ReportReviewModal';

const AdminProfilePageRefactored = () => {
    const { user, token } = useAuthState();
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('adminActiveTab') || 'dashboard';
    });
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    
    const [moderationFilter, setModerationFilter] = useState(() => {
        return localStorage.getItem('adminModerationFilter') || 'all';
    });
    const [moderationSearch, setModerationSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [approvedItems, setApprovedItems] = useState(new Set());

    const {
        loading,
        error,
        statsData,
        usersData,
        reportsData,
        activityData,
        moderationData,
        allModerationContent,
        activityPagination,
        moderationPagination,
        loadAdminData,
        loadAllModerationContent,
        loadAnnouncements,
        loadComments,
        loadReviews,
        handleResolveReport,
        handleRejectReport,
        handlePrevPage,
        handleNextPage,
        handlePageClick,
        handleModerationPrevPage,
        handleModerationNextPage,
        handleModerationPageClick,
        announcementsContent,
        announcementsPagination,
        handleAnnouncementsPrevPage,
        handleAnnouncementsNextPage,
        handleAnnouncementsPageClick,
        commentsContent,
        commentsPagination,
        handleCommentsPrevPage,
        handleCommentsNextPage,
        handleCommentsPageClick,
        reviewsContent,
        reviewsPagination,
        handleReviewsPrevPage,
        handleReviewsNextPage,
        handleReviewsPageClick,
        refreshCurrentContent,
        nameChangeRequests,
        approveNameRequest,
        rejectNameRequest,
        teacherClaimRequests,
        approveTeacherClaimRequest,
        rejectTeacherClaimRequest
    } = useAdminData();

    const tabs = [
        { id: 'dashboard', label: 'Панель управління', icon: BarChart3 },
        { id: 'users', label: 'Користувачі', icon: Users },
        { id: 'reports', label: 'Скарги', icon: AlertTriangle },
        { id: 'moderation', label: 'Модерація', icon: Shield },
        { id: 'settings', label: 'Налаштування', icon: Settings }
    ];

    // Debounce логіка для пошуку (як в форумі)
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(moderationSearch.trim());
        }, 300);
        
        return () => clearTimeout(timer);
    }, [moderationSearch]);

    // Ефект для пошуку
    useEffect(() => {
        if (searchQuery.length > 0) {
            setSearching(true);
        } else {
            setSearching(false);
        }
    }, [searchQuery]);

    const handleTabChange = (tabId) => {
        if (activeTab === tabId) {
            return;
        }
        
        setActiveTab(tabId);
        localStorage.setItem('adminActiveTab', tabId);
        
        if (tabId === 'moderation') {
            // Завантажуємо тільки потрібний тип контенту (якщо ще не завантажений)
            if (moderationFilter === 'announcements') {
                loadAnnouncements(1);
            } else if (moderationFilter === 'comments') {
                loadComments(1);
            } else if (moderationFilter === 'reviews') {
                loadReviews(1);
            }
            // 'all' вже завантажується в loadAdminData()
        }
    };

    const handleNavigateToTab = (tabId, filter = null) => {
        if (filter) {
            setModerationFilter(filter);
            localStorage.setItem('adminModerationFilter', filter);
        }
        handleTabChange(tabId);
    };

    useEffect(() => {
        if (activeTab === 'moderation') {
            if (moderationFilter === 'announcements') {
                loadAnnouncements(1);
            } else if (moderationFilter === 'comments') {
                loadComments(1);
            } else if (moderationFilter === 'reviews') {
                loadReviews(1);
            }
            // 'all' вже завантажується в loadAdminData()
        }
    }, [moderationFilter, activeTab]);

    const handleOpenReportModal = (report) => {
        setSelectedReport(report);
        setShowReportModal(true);
    };

    const handleCloseReportModal = () => {
        setShowReportModal(false);
        setSelectedReport(null);
    };

    const handleBulkDelete = async (type) => {
        try {
            console.log('Bulk delete:', type, selectedItems);
            alert(`Функція масового видалення ${type} буде реалізована`);
            setSelectedItems([]);
        } catch (error) {
            console.error('Error in bulk delete:', error);
            alert(`Помилка при масовому видаленні: ${error.message}`);
        }
    };

    const handleDeleteItem = async (itemId, itemType) => {
        try {
            console.log('Deleting item:', itemId, itemType);
            await deleteContent(itemId, itemType);
            console.log('Item deleted successfully');
            // Оновлюємо тільки поточний тип контенту, зберігаючи пагінацію
            await refreshCurrentContent(moderationFilter);
        } catch (error) {
            console.error('Error deleting item:', error);
            alert(`Помилка при видаленні: ${error.message}`);
        }
    };

    const handleApproveItem = async (itemId, itemType) => {
        try {
            console.log('Approving item:', itemId, itemType);
            console.log('Current moderationFilter:', moderationFilter);
            await approveContent(itemId, itemType);
            console.log('Item approved successfully');
            // Оновлюємо тільки поточний тип контенту, зберігаючи пагінацію
            await refreshCurrentContent(moderationFilter);
        } catch (error) {
            console.error('Error approving item:', error);
            // Видалено alert - тепер без оповіщення про помилку
        }
    };

    const handleDeleteContent = async (targetId, targetType) => {
        try {
            console.log('Deleting content:', targetId, targetType);
            alert(`Функція видалення ${targetType} буде реалізована`);
        } catch (error) {
            console.error('Error deleting content:', error);
            alert(`Помилка при видаленні контенту: ${error.message}`);
        }
    };

    const handleEditContent = async (targetId, targetType) => {
        try {
            console.log('Editing content:', targetId, targetType);
            alert(`Функція редагування ${targetType} буде реалізована`);
        } catch (error) {
            console.error('Error editing content:', error);
            alert(`Помилка при редагуванні контенту: ${error.message}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Завантаження адмін панелі...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Помилка завантаження</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={loadAdminData}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                        Спробувати знову
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 text-white hide-scrollbar">
            <div className="max-w-6xl mx-auto px-3 md:px-6 py-6 md:py-10">
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Панель адміністратора
                    </h1>
                    <p className="text-gray-300">
                        Управління системою та модерація контенту
                    </p>
                </div>

                <div className="bg-gray-100 rounded-2xl shadow-xl border border-gray-200 mb-6 md:mb-8 overflow-hidden">
                    <div className="bg-gray-200 p-1 md:p-2">
                        <nav className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4 justify-center">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`profile-tab flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 px-3 md:px-6 rounded-xl font-bold text-sm md:text-lg transition-all duration-300 flex-1 cursor-pointer ${
                                            tab.id === 'dashboard' ? 'ml-2' : tab.id === 'settings' ? 'mr-2' : ''
                                        } ${
                                            activeTab === tab.id
                                                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
                                        }`}
                                    >
                                        <Icon 
                                            size={tab.id === 'dashboard' ? 22 : 18} 
                                            className={`transition-all duration-300 ${
                                                activeTab === tab.id ? (
                                                    tab.id === 'dashboard' ? 'admin-icon-bounce' :
                                                    tab.id === 'moderation' ? 'admin-icon-pulse' :
                                                    tab.id === 'users' ? 'admin-icon-shake' :
                                                    tab.id === 'reports' ? 'admin-icon-bounce' :
                                                    tab.id === 'settings' ? 'admin-icon-rotate' : ''
                                                ) : ''
                                            }`}
                                        />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                <div className="hide-scrollbar">
                    {activeTab === 'dashboard' && (
                        <AdminDashboard
                            statsData={statsData}
                            activityData={activityData}
                            activityPagination={activityPagination}
                            handlePrevPage={handlePrevPage}
                            handleNextPage={handleNextPage}
                            handlePageClick={handlePageClick}
                            onNavigateToTab={handleNavigateToTab}
                        />
                    )}

                    {activeTab === 'users' && (
                        <AdminUsers usersData={usersData} />
                    )}

                    {activeTab === 'reports' && (
                        <AdminReports
                            reportsData={reportsData}
                            handleOpenReportModal={handleOpenReportModal}
                            handleResolveReport={handleResolveReport}
                            handleRejectReport={handleRejectReport}
                            onReportDeleted={() => loadAdminData()}
                        />
                    )}

                    {activeTab === 'moderation' && (
                        <AdminModeration
                            moderationFilter={moderationFilter}
                            setModerationFilter={setModerationFilter}
                            moderationSearch={moderationSearch}
                            setModerationSearch={setModerationSearch}
                            searchQuery={searchQuery}
                            searching={searching}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                            moderationData={moderationData}
                            allModerationContent={allModerationContent}
                            moderationPagination={moderationPagination}
                            handleModerationPrevPage={handleModerationPrevPage}
                            handleModerationNextPage={handleModerationNextPage}
                            handleModerationPageClick={handleModerationPageClick}
                            handleBulkDelete={handleBulkDelete}
                            handleDeleteItem={handleDeleteItem}
                            handleApproveItem={handleApproveItem}
                            onContentDeleted={() => refreshCurrentContent(moderationFilter)}
                            approvedItems={approvedItems}
                            loadReviews={loadReviews}
                            loadComments={loadComments}
                            announcementsContent={announcementsContent}
                            announcementsPagination={announcementsPagination}
                            handleAnnouncementsPrevPage={handleAnnouncementsPrevPage}
                            handleAnnouncementsNextPage={handleAnnouncementsNextPage}
                            handleAnnouncementsPageClick={handleAnnouncementsPageClick}
                            commentsContent={commentsContent}
                            commentsPagination={commentsPagination}
                            handleCommentsPrevPage={handleCommentsPrevPage}
                            handleCommentsNextPage={handleCommentsNextPage}
                            handleCommentsPageClick={handleCommentsPageClick}
                            reviewsContent={reviewsContent}
                            reviewsPagination={reviewsPagination}
                            handleReviewsPrevPage={handleReviewsPrevPage}
                            handleReviewsNextPage={handleReviewsNextPage}
                            handleReviewsPageClick={handleReviewsPageClick}
                            nameChangeRequests={nameChangeRequests}
                            onApproveNameRequest={(id) => approveNameRequest(id)}
                            onRejectNameRequest={(id) => rejectNameRequest(id)}
                            teacherClaimRequests={teacherClaimRequests}
                            onApproveTeacherClaimRequest={(id, notes) => approveTeacherClaimRequest(id, notes)}
                            onRejectTeacherClaimRequest={(id, notes) => rejectTeacherClaimRequest(id, notes)}
                        />
                    )}

                    {activeTab === 'settings' && (
                        <AdminSettings />
                    )}
                </div>

                {showReportModal && selectedReport && (
                    <ReportReviewModal
                        report={selectedReport}
                        onClose={handleCloseReportModal}
                        onResolve={handleResolveReport}
                        onReject={handleRejectReport}
                        onDeleteContent={handleDeleteContent}
                        onEditContent={handleEditContent}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminProfilePageRefactored;
