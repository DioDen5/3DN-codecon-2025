import React from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid'

const Pagination = ({ pageCount, handlePageClick, currentPage = 0 }) => {
    const pages = []
    
    for (let i = 0; i < pageCount; i++) {
        pages.push(i)
    }

    const handlePageNumberClick = (pageNumber) => {
        handlePageClick({ selected: pageNumber })
    }

    const handlePrevious = () => {
        if (currentPage > 0) {
            handlePageClick({ selected: currentPage - 1 })
        }
    }

    const handleNext = () => {
        if (currentPage < pageCount - 1) {
            handlePageClick({ selected: currentPage + 1 })
        }
    }

    return (
        <div className="flex justify-center gap-2 mt-10">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 0}
                className="w-10 h-10 flex items-center justify-center border border-white rounded hover:bg-white hover:text-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:disabled:cursor-not-allowed"
            >
                <ArrowLeftIcon className="w-5 h-5" />
            </button>
            
            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => handlePageNumberClick(page)}
                    className={`w-10 h-10 flex items-center justify-center border border-white rounded hover:bg-white hover:text-black cursor-pointer ${
                        currentPage === page ? 'bg-white text-black' : 'text-white'
                    }`}
                >
                    {page + 1}
                </button>
            ))}
            
            <button
                onClick={handleNext}
                disabled={currentPage === pageCount - 1}
                className="w-10 h-10 flex items-center justify-center border border-white rounded hover:bg-white hover:text-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowRightIcon className="w-5 h-5" />
            </button>
        </div>
    )
}

export default Pagination
