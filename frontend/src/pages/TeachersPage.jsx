import React, { useState } from 'react'
import teachers from '../data/teachers'
import SearchInput from '../components/SearchInput'
import TeacherCard from '../components/TeacherCard'
import { FaFilter } from 'react-icons/fa'
import ShowMoreButton from '../components/ShowMoreButton'

const TeachersPage = () => {
    const [query, setQuery] = useState('')
    const [visibleCount, setVisibleCount] = useState(12)

    const filtered = teachers.filter((t) =>
        t.name.toLowerCase().includes(query.toLowerCase())
    )

    const visibleTeachers = filtered.slice(0, visibleCount)

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 px-6 py-10 text-white">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-center text-3xl font-semibold mb-8">ВИКЛАДАЧІ</h1>
                <div className="flex flex-col sm:flex-row justify-center items-center mb-8 gap-4">
                    <button
                        className="flex items-center justify-center w-10 h-10 bg-white/10 text-white border border-white/20 rounded hover:bg-white hover:text-black transition cursor-pointer"
                    >
                        <FaFilter className="w-4 h-4" />
                    </button>
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
