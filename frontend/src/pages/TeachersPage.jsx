import React, { useState, useEffect, useMemo } from 'react'
import SearchInput from '../components/SearchInput'
import TeacherCard from '../components/TeacherCard'
import Pagination from '../components/Pagination'
import FilterDropdown from '../components/FilterDropdown'
import { getTeachers } from '../api/teachers'
import { useSort } from '../hooks/useSort'
import { useTeacherData } from '../contexts/TeacherDataContext'

const TeachersPage = () => {
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [query, setQuery] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [sortBy, setSortBy] = useState('rating')
    const [filters, setFilters] = useState({
        university: '',
        department: '',
        subject: ''
    })
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const { refreshTrigger } = useTeacherData()

    const ITEMS_PER_PAGE = 8

    const sortOptions = [
        {
            label: '⭐ За рейтингом',
            value: 'rating',
            sort: (a, b) => (b.rating || 0) - (a.rating || 0),
        },
        {
            label: '💬 За відгуками',
            value: 'comments',
            sort: (a, b) => (b.comments || 0) - (a.comments || 0),
        },
    ]

    const { SortDropdown, sortOption, setSortOption } = useSort(teachers, sortOptions)

    const highlightText = (text, query) => {
        if (!query || !text) return text;
        
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => 
            regex.test(part) ? (
                <mark 
                    key={index} 
                    className="bg-yellow-300 text-black px-1 rounded font-semibold animate-pulse"
                >
                    {part}
                </mark>
            ) : part
        );
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (!sortOption) {
            setSortOption('rating')
            setSortBy('rating')
            return
        }
        setSortBy(sortOption)
    }, [sortOption, setSortOption])

    const loadTeachers = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                sort: sortBy
            };
            
            if (searchQuery) {
                params.q = searchQuery;
            }
            
            if (filters.university) {
                params.university = filters.university;
            }
            
            if (filters.department) {
                params.department = filters.department;
            }
            
            if (filters.subject) {
                params.subject = filters.subject;
            }
            
            const data = await getTeachers(params);
            setTeachers(data.teachers);
            setTotalPages(data.pagination.totalPages);
        } catch (err) {
            setError('Помилка завантаження викладачів');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeachers();
    }, [currentPage, searchQuery, sortBy, refreshTrigger, filters]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleFilterToggle = (isOpen) => {
        setIsFilterOpen(isOpen);
    };

    return (
        <div className="min-h-[calc(100vh-68px)] bg-gradient-to-b from-black to-gray-900 px-6 py-10 text-white">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-center text-3xl font-semibold mb-8">ВИКЛАДАЧІ</h1>

                    <div className="relative flex flex-col sm:flex-row justify-center items-center mb-8 gap-4" style={{ position: 'relative', zIndex: 10 }}>
                        <div className="flex gap-3">
                            <SortDropdown className="" menuPosition="right-12" slideFrom="left" />
                            <FilterDropdown 
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                onToggle={handleFilterToggle}
                                position="right-0"
                            />
                        </div>

                        <div className="w-full sm:w-2/4">
                            <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} />
                        </div>
                    </div>

                {loading && <p className="text-center">Завантаження...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                    {!loading && !error && (
                        <div className={`transition-all duration-500 ease-out ${isFilterOpen ? 'mt-96' : 'mt-0'}`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                {teachers.map((teacher) => (
                                    <TeacherCard
                                        key={teacher._id}
                                        {...teacher}
                                        searchQuery={searchQuery}
                                        highlightText={highlightText}
                                    />
                                ))}
                            </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-10">
                                <Pagination
                                    pageCount={totalPages}
                                    currentPage={currentPage - 1}
                                    handlePageClick={({ selected }) => handlePageChange(selected + 1)}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TeachersPage
