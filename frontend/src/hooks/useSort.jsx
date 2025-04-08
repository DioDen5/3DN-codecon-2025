import { useState, useMemo, useCallback } from 'react'
import { FaFilter } from 'react-icons/fa'

export const useSort = (data = [], options = null) => {
    const [sortOption, setSortOption] = useState(null)

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

    const SortDropdown = useCallback(({ className = '' }) => {
        const [open, setOpen] = useState(false)
        const [hovered, setHovered] = useState(false)

        const showGlow = open || hovered

        const toggleDropdown = () => {
            setOpen(prev => !prev)
        }

        const handleSelect = (value) => {
            if (value === sortOption) {
                // 🔁 Same method selected — close with smooth animation
                setOpen(false)
                setTimeout(() => {
                    setHovered(false)
                }, 300) // match duration-300 for smooth glow fade
            } else {
                // ✅ New method selected — keep menu open
                setSortOption(value)

                // Make sure dropdown stays open on change
                setTimeout(() => {
                    setOpen(true)
                }, 0)
            }
        }

        return (
            <div className={`relative ${className}`}>
                <div
                    className={`absolute -top-0 left-12 z-10 flex gap-2 bg-black/80 border border-white/20 rounded-xl px-3 py-1 transition-all duration-300 ease-in-out transform ${
                        open
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 -translate-x-10 pointer-events-none'
                    }`}
                >
                    {activeOptions.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => handleSelect(value)}
                            className={`text-white text-sm py-1 px-3 rounded whitespace-nowrap transition ${
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
                    className={`flex items-center justify-center h-10 w-10 btn-glow
                        ${
                        showGlow
                            ? 'btn-glow-on'
                            : 'btn-glow-off'
                    }
                        ${
                        open
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-white hover:bg-white hover:text-black'
                    }
                    `}
                >
                    <FaFilter className="w-4 h-4" />
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
