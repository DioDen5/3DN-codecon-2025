import React from 'react';
import ModerationHeader from './ModerationHeader';
import ModerationFilters from './ModerationFilters';
import AnnouncementsList from './AnnouncementsList';
import CommentsList from './CommentsList';
import ReviewsList from './ReviewsList';
import AllContentList from './AllContentList';
import ModerationPagination from './ModerationPagination';
import NameRequestsList from './NameRequestsList';

const AdminModeration = ({
    moderationFilter,
    setModerationFilter,
    moderationSearch,
    setModerationSearch,
    searchQuery,
    searching,
    selectedItems,
    setSelectedItems,
    moderationData,
    allModerationContent,
    moderationPagination,
    handleModerationPrevPage,
    handleModerationNextPage,
    handleModerationPageClick,
    handleBulkDelete,
    handleDeleteItem,
    handleApproveItem,
    onContentDeleted,
    approvedItems,
    loadReviews,
    loadComments,
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
    nameChangeRequests,
    onApproveNameRequest,
    onRejectNameRequest
}) => {
    return (
        <div className="space-y-6">
            <ModerationHeader moderationData={moderationData} />
            
            <ModerationFilters
                moderationFilter={moderationFilter}
                setModerationFilter={setModerationFilter}
                moderationSearch={moderationSearch}
                setModerationSearch={setModerationSearch}
                selectedItems={selectedItems}
                handleBulkDelete={handleBulkDelete}
            />


            <div className="space-y-4">
                {moderationFilter === 'all' && (
                    <>
                        <AllContentList
                            allModerationContent={allModerationContent}
                            handleDeleteItem={handleDeleteItem}
                            handleApproveItem={handleApproveItem}
                            onContentDeleted={onContentDeleted}
                            approvedItems={approvedItems}
                            searchQuery={searchQuery}
                        />
                        {allModerationContent && allModerationContent.length > 0 && moderationPagination && moderationPagination.totalPages > 1 && (
                            <ModerationPagination
                                pagination={moderationPagination}
                                onPrevPage={handleModerationPrevPage}
                                onNextPage={handleModerationNextPage}
                                onPageClick={handleModerationPageClick}
                            />
                        )}
                    </>
                )}

                {moderationFilter === 'announcements' && (
                    <>
                        <AnnouncementsList
                            announcementsContent={announcementsContent}
                            handleDeleteItem={handleDeleteItem}
                            handleApproveItem={handleApproveItem}
                            onContentDeleted={onContentDeleted}
                            approvedItems={approvedItems}
                        />
                        {announcementsContent && announcementsContent.length > 0 && announcementsPagination && announcementsPagination.totalPages > 1 && (
                            <ModerationPagination
                                pagination={announcementsPagination}
                                onPrevPage={handleAnnouncementsPrevPage}
                                onNextPage={handleAnnouncementsNextPage}
                                onPageClick={handleAnnouncementsPageClick}
                            />
                        )}
                    </>
                )}

                {moderationFilter === 'comments' && (
                    <>
                        <CommentsList
                            commentsContent={commentsContent}
                            handleDeleteItem={handleDeleteItem}
                            handleApproveItem={handleApproveItem}
                            onContentDeleted={onContentDeleted}
                            approvedItems={approvedItems}
                            loadComments={loadComments}
                        />
                        {commentsContent && commentsContent.length > 0 && commentsPagination && commentsPagination.totalPages > 1 && (
                            <ModerationPagination
                                pagination={commentsPagination}
                                onPrevPage={handleCommentsPrevPage}
                                onNextPage={handleCommentsNextPage}
                                onPageClick={handleCommentsPageClick}
                            />
                        )}
                    </>
                )}

                {moderationFilter === 'reviews' && (
                    <>
                        <ReviewsList
                            reviewsContent={reviewsContent}
                            handleDeleteItem={handleDeleteItem}
                            handleApproveItem={handleApproveItem}
                            onContentDeleted={onContentDeleted}
                            approvedItems={approvedItems}
                            loadReviews={loadReviews}
                        />
                        {reviewsContent && reviewsContent.length > 0 && reviewsPagination && reviewsPagination.totalPages > 1 && (
                            <ModerationPagination
                                pagination={reviewsPagination}
                                onPrevPage={handleReviewsPrevPage}
                                onNextPage={handleReviewsNextPage}
                                onPageClick={handleReviewsPageClick}
                            />
                        )}
                    </>
                )}

                {moderationFilter === 'name-requests' && (
                    <NameRequestsList nameRequests={nameChangeRequests} onApprove={onApproveNameRequest} onReject={onRejectNameRequest} />
                )}
            </div>
        </div>
    );
};

export default AdminModeration;