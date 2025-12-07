import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { X, Check, GraduationCap, Building2, BookMarked, Sparkles } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import facultiesData from '../data/faculties.json';
import subjectsData from '../data/subjects.json';

const FilterDropdown = forwardRef(({ 
    filters = {}, 
    onFiltersChange, 
    onToggle,
    className = '',
    position = 'right-0'
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);
    const [filtersApplied, setFiltersApplied] = useState(false);
    const dropdownRef = useRef(null);

    // Autocomplete options (каскадні)
    const universityOptions = (() => {
        const base = Array.from(new Set((facultiesData || []).map(u => u.universityName)))
            .map(name => ({ name }));
        // Позначаємо кілька випадкових як popular, щоб показувати при фокусі
        const count = Math.min(5, base.length);
        const used = new Set();
        while (used.size < count) {
            const idx = Math.floor(Math.random() * base.length);
            used.add(idx);
        }
        return base.map((opt, idx) => used.has(idx) ? { ...opt, popular: true } : opt);
    })();
    const facultyOptions = (() => {
        if (!localFilters.university) return [];
        const uni = (facultiesData || []).find(u => u.universityName === localFilters.university);
        const base = (uni?.faculties || []).map(f => ({ name: f.name }));
        const count = Math.min(3, base.length);
        const used = new Set();
        while (used.size < count) {
            const idx = Math.floor(Math.random() * base.length);
            used.add(idx);
        }
        return base.map((opt, idx) => used.has(idx) ? { ...opt, popular: true } : opt);
    })();
    const subjectOptions = (() => {
        if (!localFilters.department) return [];
        const fac = (subjectsData || []).find(f => f.facultyName === localFilters.department);
        const base = (fac?.subjects || []).map(s => ({ name: s }));
        const count = Math.min(5, base.length);
        const used = new Set();
        while (used.size < count) {
            const idx = Math.floor(Math.random() * base.length);
            used.add(idx);
        }
        return base.map((opt, idx) => used.has(idx) ? { ...opt, popular: true } : opt);
    })();

    useEffect(() => {
        setLocalFilters(filters);
        // Перевіряємо чи є активні фільтри при завантаженні
        const hasActiveFilters = Object.values(filters).some(value => value !== '');
        setFiltersApplied(hasActiveFilters);
    }, [filters]);

    // Removed click outside handler to prevent auto-closing
    // useEffect(() => {
    //     const handleClickOutside = (event) => {
    //         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
    //             handleClose();
    //         }
    //     };

    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => document.removeEventListener('mousedown', handleClickOutside);
    // }, []);

    // Видаляємо цей useEffect, оскільки тепер логіка анімації в handleOpen

    const handleFilterChange = (filterType, value) => {
        const newFilters = { ...localFilters, [filterType]: value };
        // Каскадне очищення: якщо змінюємо університет — чистимо факультет і предмет; якщо факультет — чистимо предмет
        if (filterType === 'university') {
            newFilters.department = '';
            newFilters.subject = '';
        }
        if (filterType === 'department') {
            newFilters.subject = '';
        }
        setLocalFilters(newFilters);
    };

    const handleOpen = () => {
        setIsOpen(true);
        onToggle?.(true);
        // Невелика затримка для того, щоб DOM оновився перед анімацією
        setTimeout(() => {
            setIsAnimating(true);
        }, 10);
    };

    const handleClose = () => {
        setIsAnimating(false);
        onToggle?.(false);
        setTimeout(() => {
            setIsOpen(false);
        }, 300);
    };

    const handleApplyFilters = () => {
        onFiltersChange(localFilters);
        setFiltersApplied(true);
        handleClose();
    };

    const handleClearFilters = () => {
        const clearedFilters = Object.keys(localFilters).reduce((acc, key) => {
            acc[key] = '';
            return acc;
        }, {});
        setLocalFilters(clearedFilters);
        onFiltersChange(clearedFilters);
        setFiltersApplied(false);
        // Не закриваємо фільтр, залишаємо відкритим
    };

    const hasActiveFilters = Object.values(localFilters).some(value => value !== '');

    const [hovered, setHovered] = useState(false);
    const showGlow = isOpen || hovered;

    // Expose open() to parent
    useImperativeHandle(ref, () => ({
        open: handleOpen,
        close: handleClose
    }));

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={isOpen ? handleClose : handleOpen}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={`flex items-center justify-center w-10 h-10 border border-white/20 rounded cursor-pointer 
                    transition-all duration-500 ease-in-out
                    ${showGlow
                        ? 'shadow-[0_0_140px_22px_rgba(255,255,255,0.3)]'
                        : 'shadow-[0_0_140px_22px_rgba(255,255,255,0)]'}
                    ${isOpen
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white hover:bg-white hover:text-black'}
                `}
            >
                <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="1.5" rx="0.75" />
                    <circle cx="4" cy="3.75" r="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="2" y="7" width="12" height="1.5" rx="0.75" />
                    <circle cx="8" cy="7.75" r="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="2" y="11" width="12" height="1.5" rx="0.75" />
                    <circle cx="12" cy="11.75" r="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                    {(hasActiveFilters || filtersApplied) && (
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                            filtersApplied 
                                ? 'bg-green-500' 
                                : 'bg-red-500 animate-pulse'
                        }`}></div>
                    )}
            </button>

                {isOpen && (
                    <div className="absolute z-50 flex justify-center" style={{
                        // TODO: Refactor this temporary positioning hack
                        // This is a workaround for specific positioning requirements
                        top: '60%',
                        left: '737.5%', // Temporary extreme value for positioning
                        transform: 'translateX(-50%)',
                        width: '100vw',
                        marginTop: '2rem'
                    }}>
                    <div className="w-full max-w-6xl mx-6">
                        <div className={`bg-gradient-to-b from-black to-gray-900 rounded-3xl shadow-2xl border border-gray-700 transform transition-all duration-500 ease-out ${
                            isAnimating 
                                ? 'translate-y-0 opacity-100 scale-100' 
                                : '-translate-y-12 opacity-0 scale-90'
                        }`}>
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-white">
                                        Фільтрація викладачів
                                    </h3>
                                    <button
                                        onClick={handleClose}
                                        className="p-2 rounded-full bg-gray-900 hover:bg-gray-700 transition-all duration-300 group transform hover:scale-110 active:scale-95 cursor-pointer"
                                    >
                                        <X 
                                            className="w-6 h-6 text-gray-400 group-hover:text-white transition-all duration-300" 
                                            style={{ transform: 'rotate(0deg)' }}
                                            onMouseEnter={(e) => e.target.style.transform = 'rotate(90deg)'}
                                            onMouseLeave={(e) => e.target.style.transform = 'rotate(0deg)'}
                                        />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="animate-in slide-in-from-left-2 fade-in-0" style={{ animationDelay: '0ms' }}>
                                        <label className="flex items-center gap-3 text-lg font-semibold text-gray-200 mb-4">
                                            <GraduationCap className="w-6 h-6 text-blue-400" /> Університет
                                        </label>
                                        <AutocompleteInput
                                            value={localFilters.university || ''}
                                            onChange={(v) => handleFilterChange('university', v)}
                                            options={universityOptions}
                                            placeholder="Оберіть або введіть університет"
                                            showPopular={true}
                                            maxResults={8}
                                            allowCustomInput={true}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none transition-all duration-300 focus:border-blue-400 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                            truncateTwoWordsAndChars
                                            truncateNextChars={7}
                                        />
                                    </div>

                                    <div className="animate-in slide-in-from-left-2 fade-in-0" style={{ animationDelay: '150ms' }}>
                                        <label className="flex items-center gap-3 text-lg font-semibold text-gray-200 mb-4">
                                            <Building2 className="w-6 h-6 text-green-400" /> Факультет
                                        </label>
                                        <AutocompleteInput
                                            value={localFilters.department || ''}
                                            onChange={(v) => handleFilterChange('department', v)}
                                            options={facultyOptions}
                                            placeholder={localFilters.university ? 'Оберіть або введіть факультет' : 'Спочатку оберіть університет'}
                                            disabled={!localFilters.university}
                                            showPopular={true}
                                            maxResults={8}
                                            allowCustomInput={true}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none transition-all duration-300 focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                            truncateTwoWordsAndChars
                                            truncateNextChars={7}
                                        />
                                    </div>

                                    <div className="animate-in slide-in-from-left-2 fade-in-0" style={{ animationDelay: '300ms' }}>
                                        <label className="flex items-center gap-3 text-lg font-semibold text-gray-200 mb-4">
                                            <BookMarked className="w-6 h-6 text-purple-400" /> Предмет
                                        </label>
                                        <AutocompleteInput
                                            value={localFilters.subject || ''}
                                            onChange={(v) => handleFilterChange('subject', v)}
                                            options={subjectOptions}
                                            placeholder={localFilters.department ? 'Оберіть предмет' : 'Спочатку оберіть факультет'}
                                            disabled={!localFilters.department}
                                            showPopular={true}
                                            maxResults={10}
                                            allowCustomInput={true}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none transition-all duration-300 focus:border-purple-400 focus:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                            truncateTwoWordsAndChars
                                            truncateNextChars={7}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700 animate-in slide-in-from-bottom-2 fade-in-0">
                                        <button
                                            onClick={handleApplyFilters}
                                            className="flex-1 bg-gradient-to-r from-blue-700 to-blue-800 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-3 font-semibold text-lg shadow-xl hover:shadow-2xl cursor-pointer active:scale-[0.98] group"
                                        >
                                        <span className="group-hover:animate-pulse">Застосувати фільтри</span>
                                        </button>
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-6 py-4 border-2 border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 hover:border-gray-500 transition-all duration-300 font-semibold text-lg hover:scale-105 cursor-pointer active:scale-[0.98]"
                                    >
                                        Очистити
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default FilterDropdown;
