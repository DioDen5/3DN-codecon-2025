import React from 'react';

const ModerationPagination = ({
    pagination,
    onPrevPage,
    onNextPage,
    onPageClick
}) => {
    if (!pagination || pagination.totalPages <= 1) {
        return null;
    }

    const renderPageNumbers = () => {
        const currentPage = pagination.currentPage;
        const totalPages = pagination.totalPages;
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
                    onClick={() => onPageClick(1)}
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
                    onClick={() => onPageClick(i)}
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
                    onClick={() => onPageClick(totalPages)}
                    className="w-10 h-10 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 hover:scale-105 hover:shadow-md hover:shadow-blue-200/50 transition-all duration-500 cursor-pointer"
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-4 mt-8">
            <button
                onClick={onPrevPage}
                disabled={!pagination.hasPrevPage}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 transform ${
                    pagination.hasPrevPage
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:cursor-not-allowed'
                }`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Попередня
            </button>

            <div className="flex items-center gap-2">
                {renderPageNumbers()}
            </div>

            <button
                onClick={onNextPage}
                disabled={!pagination.hasNextPage}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 transform cursor-pointer ${
                    pagination.hasNextPage
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
    );
};

export default ModerationPagination;
