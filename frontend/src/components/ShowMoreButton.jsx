import React from 'react'

const ShowMoreButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="px-6 py-2 rounded-md border border-white/20 text-white hover:bg-white hover:text-black transition"
        >
            Показати більше
        </button>
    )
}

export default ShowMoreButton
