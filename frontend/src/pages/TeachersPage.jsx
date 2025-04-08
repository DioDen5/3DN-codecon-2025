import React, { useState } from 'react'
import teachers from '../data/teachers'
import SearchInput from '../components/SearchInput'
import TeacherCard from '../components/TeacherCard'
import ShowMoreButton from '../components/ShowMoreButton'
import { useSort } from '../hooks/useSort' // твій хук

const TeachersPage = () => {
    const [query, setQuery] = useState('')
    const [visibleCount, setVisibleCount] = useState(12)

    // 🔽 кастомізовані опції сортування
    const {
        sortedData: sortedTeachers,
        SortDropdown
    } = useSort(teachers, [
        {
            label: '🤍 За лайками',
            value: 'likes',
            sort: (a, b) => (b.likes || 0) - (a.likes || 0),
        },
        {
            label: '💬 За відгуками',
            value: 'reviews',
            sort: (a, b) => (b.reviews || 0) - (a.reviews || 0),
        },
    ])

    // 🔍 пошук
    const filtered = sortedTeachers.filter((t) =>
        t.name.toLowerCase().includes(query.toLowerCase())
    )

    const visibleTeachers = filtered.slice(0, visibleCount)

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 px-6 py-10 text-white">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-center text-3xl font-semibold mb-8">ВИКЛАДАЧІ</h1>

                <div className="flex flex-col sm:flex-row justify-center items-center mb-8 gap-4">
                    <SortDropdown className="" menuPosition="right-12" slideFrom="left" />

                    <div className="w-full sm:w-2/4">
                        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {visibleTeachers.map((teacher, index) => (
                        <TeacherCard key={index} {...teacher} />
                    ))}
                </div>

                {visibleCount < filtered.length && (
                    <div className="flex justify-center mt-10">
                        <ShowMoreButton onClick={() => setVisibleCount(prev => prev + 12)} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default TeachersPage
