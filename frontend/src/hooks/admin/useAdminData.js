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

            const [stats, users, reports, nameChanges, activityResponse] = await Promise.all([
                getAdminStats(),
                getAdminUsers(),
                getAdminReports(),
                getAdminNameChangeRequests(),
                getAdminActivity(1)
            ]);

            setStatsData(stats);
            setUsersData(users);
            setReportsData(reports);
            setNameChangeRequests(nameChanges);
            setActivityData(activityResponse.content || []);
            setActivityPagination(activityResponse.pagination || {
                currentPage: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
                totalItems: 0
            });

            const moderationData = {
                announcements: stats.activeAnnouncements,
                comments: stats.totalComments,
                reviews: stats.totalReviews
            };
            setModerationData(moderationData);


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
            const data = await getModerationReviews(page, 5);
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

    const handlePrevPage = async () => {
        if (activityPagination.hasPrevPage) {
            const newPage = activityPagination.currentPage - 1;
            try {
                const response = await getAdminActivity(newPage);
                setActivityData(response.content || []);
                setActivityPagination(response.pagination || {
                    currentPage: newPage,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: newPage > 1,
                    totalItems: 0
                });
            } catch (error) {
                console.error('Error loading activity:', error);
            }
        }
    };

    const handleNextPage = async () => {
        if (activityPagination.hasNextPage) {
            const newPage = activityPagination.currentPage + 1;
            try {
                const response = await getAdminActivity(newPage);
                setActivityData(response.content || []);
                setActivityPagination(response.pagination || {
                    currentPage: newPage,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: newPage > 1,
                    totalItems: 0
                });
            } catch (error) {
                console.error('Error loading activity:', error);
            }
        }
    };

    const handlePageClick = async (page) => {
        try {
            const response = await getAdminActivity(page);
            setActivityData(response.content || []);
            setActivityPagination(response.pagination || {
                currentPage: page,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: page > 1,
                totalItems: 0
            });
        } catch (error) {
            console.error('Error loading activity:', error);
        }
    };

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

    const handleReviewsPrevPage = async () => {
        if (reviewsPagination.hasPrevPage) {
            const newPage = reviewsPagination.currentPage - 1;
            try {
                const data = await getModerationReviews(newPage, 5);
                setReviewsContent(data.content || []);
                setReviewsPagination({
                    currentPage: data.pagination?.currentPage || newPage,
                    totalPages: data.pagination?.totalPages || 1,
                    hasNextPage: data.pagination?.hasNextPage || false,
                    hasPrevPage: data.pagination?.hasPrevPage || false,
                    totalItems: data.pagination?.totalItems || 0
                });
            } catch (error) {
                console.error('Error loading reviews:', error);
            }
        }
    };

    const handleReviewsNextPage = async () => {
        if (reviewsPagination.hasNextPage) {
            const newPage = reviewsPagination.currentPage + 1;
            try {
                const data = await getModerationReviews(newPage, 5);
                setReviewsContent(data.content || []);
                setReviewsPagination({
                    currentPage: data.pagination?.currentPage || newPage,
                    totalPages: data.pagination?.totalPages || 1,
                    hasNextPage: data.pagination?.hasNextPage || false,
                    hasPrevPage: data.pagination?.hasPrevPage || false,
                    totalItems: data.pagination?.totalItems || 0
                });
            } catch (error) {
                console.error('Error loading reviews:', error);
            }
        }
    };

    const handleReviewsPageClick = async (page) => {
        try {
            const data = await getModerationReviews(page, 5);
            setReviewsContent(data.content || []);
            setReviewsPagination(data.pagination || {
                currentPage: page,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: page > 1,
                totalItems: 0
            });
        } catch (error) {
            console.error('Error loading reviews page:', error);
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
        handleCommentsPageClick,
        handleReviewsPrevPage,
        handleReviewsNextPage,
        handleReviewsPageClick
    };
};
