import { useState, useMemo, useCallback } from 'react'
import { FaFilter } from 'react-icons/fa'

export const useSort = (data = [], options = null, initialSort = null) => {
    const [sortOption, setSortOption] = useState(initialSort)

    const defaultOptions = [
        {
            label: '🔤 Від А до Я',
            value: 'alphabet',
            sort: (a, b) => (a.title || '').localeCompare(b.title || ''),
        },
        {
            label: '🤍 За лайками',
            value: 'likes',
            sort: (a, b) => (b.rating_positive || 0) - (a.rating_positive || 0),
        },
        {
            label: '💬 За коментарями',
            value: 'comments',
            sort: (a, b) => b.comment_count - a.comment_count,
        },
        {
            label: '🕓 Найновіші',
            value: 'newest',
            sort: (a, b) => new Date(b.created_at) - new Date(a.created_at),
        },
    ]

    const activeOptions = options || defaultOptions

    const sortedData = useMemo(() => {
        const sorted = [...data]
        const active = activeOptions.find(opt => opt.value === sortOption)
        return active?.sort ? sorted.sort(active.sort) : sorted
    }, [data, sortOption, activeOptions])

    const SortDropdown = useCallback(({ className = '', slideFrom = 'right', menuPosition = 'left-12' }) => {
        const [open, setOpen] = useState(false)
        const [hovered, setHovered] = useState(false)

        const showGlow = open || hovered

        const toggleDropdown = () => setOpen(prev => !prev)

        const handleSelect = (value) => {
            if (value === sortOption) {
                setOpen(false)
                setTimeout(() => setHovered(false), 300)
            } else {
                setSortOption(value)
                setOpen(true)
            }
        }

        const closedTransform = slideFrom === 'left'
            ? 'translate-x-12'
            : '-translate-x-10'

        return (
            <div className={`relative ${className}`}>
                
                <div
                    className={`absolute top-0 ${menuPosition} z-10 flex gap-2 bg-black/80 border border-white/20
          rounded-xl px-3 py-1 transition-all duration-300 ease-in-out transform ${
                        open
                            ? 'opacity-100 translate-x-0'
                            : `opacity-0 ${closedTransform} pointer-events-none`
                    }`}
                >
                    {activeOptions.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => handleSelect(value)}
                            className={`text-white text-sm py-1 px-3 rounded whitespace-nowrap transition cursor-pointer ${
                                sortOption === value
                                    ? 'bg-white/20'
                                    : 'bg-black/70 hover:bg-white/10'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                
                <button
                    onClick={toggleDropdown}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    className={`flex items-center justify-center w-10 h-10 border border-white/20 rounded cursor-pointer
          transition-all duration-500 ease-in-out
          ${showGlow
                        ? 'shadow-[0_0_140px_22px_rgba(255,255,255,0.3)]'
                        : 'shadow-[0_0_140px_22px_rgba(255,255,255,0)]'}
          ${open
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white hover:bg-white hover:text-black'}
        `}
                >
                    <FaFilter className="w-4 h-4" />
                    {sortOption && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500"></div>
                    )}
                </button>
            </div>
        )
    }, [sortOption, activeOptions])

    return {
        sortedData,
        sortOption,
        setSortOption,
        SortDropdown,
    }
}
