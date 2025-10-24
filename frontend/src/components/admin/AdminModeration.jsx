import React from 'react';
import ModerationHeader from './ModerationHeader';
import ModerationFilters from './ModerationFilters';
import AnnouncementsList from './AnnouncementsList';
import AllContentList from './AllContentList';
import ModerationPagination from './ModerationPagination';

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
    handleDeleteItem,
    announcementsContent,
    announcementsPagination,
    handleAnnouncementsPrevPage,
    handleAnnouncementsNextPage,
    handleAnnouncementsPageClick
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
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                            handleDeleteItem={handleDeleteItem}
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
            </div>
        </div>
    );
};

export default AdminModeration;