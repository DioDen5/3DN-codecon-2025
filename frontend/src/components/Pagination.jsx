import React from 'react'
import ReactPaginate from 'react-paginate'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid'

const Pagination = ({ pageCount, handlePageClick }) => {
    return (
        <ReactPaginate
            breakLabel="..."
            previousLabel={
                <div className="w-10 h-10 flex items-center justify-center border border-white rounded hover:bg-white hover:text-black cursor-pointer">
                    <ArrowLeftIcon className="w-5 h-5 pointer-events-none" />
                </div>
            }
            nextLabel={
                <div className="w-10 h-10 flex items-center justify-center border border-white rounded hover:bg-white hover:text-black cursor-pointer">
                    <ArrowRightIcon className="w-5 h-5 pointer-events-none" />
                </div>
            }
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            pageCount={pageCount}
            containerClassName="flex justify-center gap-2 mt-10"
            pageClassName="w-10 h-10 flex items-center justify-center border border-white rounded hover:bg-white hover:text-black cursor-pointer"
            activeClassName="bg-white text-black"
            breakClassName="text-white"
            previousClassName=""
            nextClassName=""
        />
    )
}

export default Pagination
