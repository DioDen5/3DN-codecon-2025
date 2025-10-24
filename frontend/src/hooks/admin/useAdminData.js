import { useState, useEffect, useCallback } from 'react';
import { 
    getAdminStats, 
    getAdminUsers, 
    getAdminReports, 
    getAdminNameChangeRequests, 
    getAdminActivity,
    getAllModerationContent,
    getModerationAnnouncements,
    getModerationComments,
    getModerationReviews,
    resolveReport,
    rejectReport
} from '../../api/admin-stats';

export const useAdminData = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [statsData, setStatsData] = useState(null);
    const [usersData, setUsersData] = useState([]);
    const [reportsData, setReportsData] = useState([]);
    const [nameChangeRequests, setNameChangeRequests] = useState([]);
    const [activityData, setActivityData] = useState([]);
    
    const [moderationData, setModerationData] = useState(null);
    const [allModerationContent, setAllModerationContent] = useState([]);
    const [announcementsContent, setAnnouncementsContent] = useState([]);
    const [commentsContent, setCommentsContent] = useState([]);
    const [reviewsContent, setReviewsContent] = useState([]);
    
    const [activityPagination, setActivityPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        totalActivities: 0
    });
    
    const [moderationPagination, setModerationPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        totalItems: 0
    });
    
    const [announcementsPagination, setAnnouncementsPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        totalItems: 0
    });
    
    const [commentsPagination, setCommentsPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        totalItems: 0
    });
    
    const [reviewsPagination, setReviewsPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        totalItems: 0
    });

    const loadAdminData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Завантаження основних даних
            const [stats, users, reports, nameChanges, activity] = await Promise.all([
                getAdminStats(),
                getAdminUsers(),
                getAdminReports(),
                getAdminNameChangeRequests(),
                getAdminActivity()
            ]);

            setStatsData(stats);
            setUsersData(users);
            setReportsData(reports);
            setNameChangeRequests(nameChanges);
            setActivityData(activity);

            const moderationData = {
                announcements: stats.activeAnnouncements,
                comments: stats.totalComments,
                reviews: stats.totalReviews
            };
            setModerationData(moderationData);

            const itemsPerPage = 4;
            const totalActivities = activity.length;
            const totalPages = Math.ceil(totalActivities / itemsPerPage);
            
            setActivityPagination({
                currentPage: 1,
                totalPages,
                hasNextPage: totalPages > 1,
                hasPrevPage: false,
                totalActivities
            });

            try {
                const allContentData = await getAllModerationContent(1, 5);
                setAllModerationContent(allContentData.content || []);
                setModerationPagination({
                    currentPage: allContentData.pagination?.currentPage || 1,
                    totalPages: allContentData.pagination?.totalPages || 1,
                    hasNextPage: allContentData.pagination?.hasNextPage || false,
                    hasPrevPage: allContentData.pagination?.hasPrevPage || false,
                    totalItems: allContentData.pagination?.totalItems || 0
                });
            } catch (error) {
                console.error('Error loading all moderation content:', error);
                setAllModerationContent([]);
            }

            // Завантаження обговорень для модерації
            try {
                const announcementsData = await getModerationAnnouncements(1, 5);
                setAnnouncementsContent(announcementsData.content || []);
                setAnnouncementsPagination({
                    currentPage: announcementsData.pagination?.currentPage || 1,
                    totalPages: announcementsData.pagination?.totalPages || 1,
                    hasNextPage: announcementsData.pagination?.hasNextPage || false,
                    hasPrevPage: announcementsData.pagination?.hasPrevPage || false,
                    totalItems: announcementsData.pagination?.totalItems || 0
                });
            } catch (error) {
                console.error('Error loading announcements:', error);
                setAnnouncementsContent([]);
            }

        } catch (error) {
            console.error('Error loading admin data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadAnnouncements = async (page = 1) => {
        try {
            const data = await getModerationAnnouncements(page, 5);
            setAnnouncementsContent(data.content || []);
            setAnnouncementsPagination({
                currentPage: data.pagination?.currentPage || 1,
                totalPages: data.pagination?.totalPages || 1,
                hasNextPage: data.pagination?.hasNextPage || false,
                hasPrevPage: data.pagination?.hasPrevPage || false,
                totalItems: data.pagination?.totalItems || 0
            });
        } catch (error) {
            console.error('Error loading announcements:', error);
            setAnnouncementsContent([]);
        }
    };

    const loadComments = async (page = 1) => {
        try {
            const data = await getModerationComments(page, 5);
            setCommentsContent(data.content || []);
            setCommentsPagination({
                currentPage: data.pagination?.currentPage || 1,
                totalPages: data.pagination?.totalPages || 1,
                hasNextPage: data.pagination?.hasNextPage || false,
                hasPrevPage: data.pagination?.hasPrevPage || false,
                totalItems: data.pagination?.totalItems || 0
            });
        } catch (error) {
            console.error('Error loading comments:', error);
            setCommentsContent([]);
        }
    };

    const loadReviews = async (page = 1) => {
        try {
            const data = await getModerationReviews(page, 10);
            setReviewsContent(data.content || []);
            setReviewsPagination({
                currentPage: data.pagination?.currentPage || 1,
                totalPages: data.pagination?.totalPages || 1,
                hasNextPage: data.pagination?.hasNextPage || false,
                hasPrevPage: data.pagination?.hasPrevPage || false,
                totalItems: data.pagination?.totalItems || 0
            });
        } catch (error) {
            console.error('Error loading reviews:', error);
            setReviewsContent([]);
        }
    };

    const handleResolveReport = async (reportId) => {
        try {
            console.log('Resolving report:', reportId);
            await resolveReport(reportId);
            await loadAdminData(); 
        } catch (error) {
            console.error('Error resolving report:', error);
        }
    };

    const handleRejectReport = async (reportId) => {
        try {
            console.log('Rejecting report:', reportId);
            await rejectReport(reportId);
            await loadAdminData(); 
        } catch (error) {
            console.error('Error rejecting report:', error);
        }
    };

    const handlePrevPage = () => {
        if (activityPagination.hasPrevPage) {
            setActivityPagination(prev => ({
                ...prev,
                currentPage: prev.currentPage - 1,
                hasNextPage: true,
                hasPrevPage: prev.currentPage - 1 > 1
            }));
        }
    };

    const handleNextPage = () => {
        if (activityPagination.hasNextPage) {
            setActivityPagination(prev => ({
                ...prev,
                currentPage: prev.currentPage + 1,
                hasNextPage: prev.currentPage + 1 < prev.totalPages,
                hasPrevPage: true
            }));
        }
    };

    const handlePageClick = (page) => {
        setActivityPagination(prev => ({
            ...prev,
            currentPage: page,
            hasNextPage: page < prev.totalPages,
            hasPrevPage: page > 1
        }));
    };

    // Пагінація для модерації
    const handleModerationPrevPage = async () => {
        if (moderationPagination.hasPrevPage) {
            const newPage = moderationPagination.currentPage - 1;
            try {
                const data = await getAllModerationContent(newPage, 5);
                setAllModerationContent(data.content || []);
                setModerationPagination({
                    currentPage: data.pagination?.currentPage || newPage,
                    totalPages: data.pagination?.totalPages || 1,
                    hasNextPage: data.pagination?.hasNextPage || false,
                    hasPrevPage: data.pagination?.hasPrevPage || false,
                    totalItems: data.pagination?.totalItems || 0
                });
            } catch (error) {
                console.error('Error loading moderation content:', error);
            }
        }
    };

    const handleModerationNextPage = async () => {
        if (moderationPagination.hasNextPage) {
            const newPage = moderationPagination.currentPage + 1;
            try {
                const data = await getAllModerationContent(newPage, 5);
                setAllModerationContent(data.content || []);
                setModerationPagination({
                    currentPage: data.pagination?.currentPage || newPage,
                    totalPages: data.pagination?.totalPages || 1,
                    hasNextPage: data.pagination?.hasNextPage || false,
                    hasPrevPage: data.pagination?.hasPrevPage || false,
                    totalItems: data.pagination?.totalItems || 0
                });
            } catch (error) {
                console.error('Error loading moderation content:', error);
            }
        }
    };

    const handleModerationPageClick = async (page) => {
        try {
            const data = await getAllModerationContent(page, 5);
            setAllModerationContent(data.content || []);
            setModerationPagination({
                currentPage: data.pagination?.currentPage || page,
                totalPages: data.pagination?.totalPages || 1,
                hasNextPage: data.pagination?.hasNextPage || false,
                hasPrevPage: data.pagination?.hasPrevPage || false,
                totalItems: data.pagination?.totalItems || 0
            });
        } catch (error) {
            console.error('Error loading moderation content:', error);
        }
    };

    useEffect(() => {
        loadAdminData();
    }, [loadAdminData]);

    const handleAnnouncementsPrevPage = async () => {
        if (announcementsPagination.hasPrevPage) {
            const newPage = announcementsPagination.currentPage - 1;
            try {
                const data = await getModerationAnnouncements(newPage, 5);
                setAnnouncementsContent(data.content || []);
                setAnnouncementsPagination({
                    currentPage: data.pagination?.currentPage || newPage,
                    totalPages: data.pagination?.totalPages || 1,
                    hasNextPage: data.pagination?.hasNextPage || false,
                    hasPrevPage: data.pagination?.hasPrevPage || false,
                    totalItems: data.pagination?.totalItems || 0
                });
            } catch (error) {
                console.error('Error loading announcements:', error);
            }
        }
    };

    const handleAnnouncementsNextPage = async () => {
        if (announcementsPagination.hasNextPage) {
            const newPage = announcementsPagination.currentPage + 1;
            try {
                const data = await getModerationAnnouncements(newPage, 5);
                setAnnouncementsContent(data.content || []);
                setAnnouncementsPagination({
                    currentPage: data.pagination?.currentPage || newPage,
                    totalPages: data.pagination?.totalPages || 1,
                    hasNextPage: data.pagination?.hasNextPage || false,
                    hasPrevPage: data.pagination?.hasPrevPage || false,
                    totalItems: data.pagination?.totalItems || 0
                });
            } catch (error) {
                console.error('Error loading announcements:', error);
            }
        }
    };

    const handleAnnouncementsPageClick = async (page) => {
        try {
            const data = await getModerationAnnouncements(page, 5);
            setAnnouncementsContent(data.content || []);
            setAnnouncementsPagination(data.pagination || {
                currentPage: page,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: page > 1,
                totalItems: 0
            });
        } catch (error) {
            console.error('Error loading announcements page:', error);
        }
    };

    const handleCommentsPrevPage = async () => {
        if (commentsPagination.hasPrevPage) {
            const newPage = commentsPagination.currentPage - 1;
            try {
                const data = await getModerationComments(newPage, 5);
                setCommentsContent(data.content || []);
                setCommentsPagination({
                    currentPage: data.pagination?.currentPage || newPage,
                    totalPages: data.pagination?.totalPages || 1,
                    hasNextPage: data.pagination?.hasNextPage || false,
                    hasPrevPage: data.pagination?.hasPrevPage || false,
                    totalItems: data.pagination?.totalItems || 0
                });
            } catch (error) {
                console.error('Error loading comments:', error);
            }
        }
    };

    const handleCommentsNextPage = async () => {
        if (commentsPagination.hasNextPage) {
            const newPage = commentsPagination.currentPage + 1;
            try {
                const data = await getModerationComments(newPage, 5);
                setCommentsContent(data.content || []);
                setCommentsPagination({
                    currentPage: data.pagination?.currentPage || newPage,
                    totalPages: data.pagination?.totalPages || 1,
                    hasNextPage: data.pagination?.hasNextPage || false,
                    hasPrevPage: data.pagination?.hasPrevPage || false,
                    totalItems: data.pagination?.totalItems || 0
                });
            } catch (error) {
                console.error('Error loading comments:', error);
            }
        }
    };

    const handleCommentsPageClick = async (page) => {
        try {
            const data = await getModerationComments(page, 5);
            setCommentsContent(data.content || []);
            setCommentsPagination(data.pagination || {
                currentPage: page,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: page > 1,
                totalItems: 0
            });
        } catch (error) {
            console.error('Error loading comments page:', error);
        }
    };

    return {
        loading,
        error,
        statsData,
        usersData,
        reportsData,
        nameChangeRequests,
        activityData,
        moderationData,
        allModerationContent,
        announcementsContent,
        commentsContent,
        reviewsContent,
        activityPagination,
        moderationPagination,
        announcementsPagination,
        commentsPagination,
        reviewsPagination,
        loadAdminData,
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
        handleAnnouncementsPrevPage,
        handleAnnouncementsNextPage,
        handleAnnouncementsPageClick,
        handleCommentsPrevPage,
        handleCommentsNextPage,
        handleCommentsPageClick
    };
};
