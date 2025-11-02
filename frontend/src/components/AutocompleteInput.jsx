import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import './AutocompleteInput.css';

const AutocompleteInput = ({ 
    value, 
    onChange, 
    options = [], 
    placeholder = '',
    onFocus,
    onBlur,
    className = '',
    error = false,
    showPopular = true,
    maxResults = 8
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState([]);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Відсортувати опції: спочатку популярні, потім за релевантністю
    useEffect(() => {
        if (!searchTerm.trim()) {
            // Якщо немає пошуку, показуємо популярні
            const popular = options.filter(opt => opt.popular).slice(0, showPopular ? 5 : 0);
            setFilteredOptions(popular);
        } else {
            // Фільтруємо та сортуємо за релевантністю
            const term = searchTerm.toLowerCase();
            const filtered = options
                .filter(opt => {
                    const name = opt.name.toLowerCase();
                    const shortName = opt.shortName?.toLowerCase() || '';
                    return name.includes(term) || shortName.includes(term);
                })
                .sort((a, b) => {
                    // Популярні першими
                    if (a.popular && !b.popular) return -1;
                    if (!a.popular && b.popular) return 1;
                    
                    // Потім за початком збігу
                    const aName = a.name.toLowerCase();
                    const bName = b.name.toLowerCase();
                    const aStarts = aName.startsWith(term);
                    const bStarts = bName.startsWith(term);
                    if (aStarts && !bStarts) return -1;
                    if (!aStarts && bStarts) return 1;
                    
                    return 0;
                })
                .slice(0, maxResults);
            
            setFilteredOptions(filtered);
        }
    }, [searchTerm, options, showPopular, maxResults]);

    // Оновити searchTerm коли змінюється value (ззовні)
    useEffect(() => {
        if (value) {
            setSearchTerm(value);
        } else if (!isOpen && !searchTerm) {
            setSearchTerm('');
        }
    }, [value]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setIsOpen(true);
        
        // Якщо поле очищено, очистити значення
        if (!newValue.trim()) {
            onChange('');
        }
    };

    const handleSelect = (option) => {
        setSearchTerm(option.name);
        onChange(option.name);
        setIsOpen(false);
        inputRef.current?.blur();
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setSearchTerm('');
        onChange('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleFocus = () => {
        setIsOpen(true);
        onFocus?.();
    };

    const handleBlur = (e) => {
        // Затримка, щоб дати час на клік по опції
        setTimeout(() => {
            if (!dropdownRef.current?.contains(document.activeElement)) {
                setIsOpen(false);
                onBlur?.();
            }
        }, 200);
    };

    // Закрити dropdown при кліку поза ним
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !inputRef.current?.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const baseInputClasses = className || 'w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 text-gray-800 focus:outline-none transition-all duration-300';
    const inputClasses = error
        ? `${baseInputClasses} border border-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]`
        : searchTerm.trim() || isOpen
            ? `${baseInputClasses} border border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] focus:border-blue-400 focus:shadow-[0_0_12px_rgba(59,130,246,0.6)]`
            : `${baseInputClasses} border border-gray-500`;

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={inputClasses}
                    placeholder={placeholder}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <ChevronDown 
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                    />
                </div>
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <div 
                    ref={dropdownRef}
                    className={`autocomplete-dropdown-wrapper absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg ${
                        filteredOptions.length > 3 ? 'always-show-scrollbar' : 'overflow-y-auto max-h-64'
                    }`}
                    style={filteredOptions.length > 3 ? { height: '16rem', overflowY: 'scroll' } : { maxHeight: '16rem' }}
                >
                    {filteredOptions.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                            <div className="font-medium text-gray-800">{option.name}</div>
                            {option.shortName && (
                                <div className="text-xs text-gray-500 mt-0.5">{option.shortName}</div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {isOpen && searchTerm.trim() && filteredOptions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    Нічого не знайдено
                </div>
            )}
        </div>
    );
};

export default AutocompleteInput;

