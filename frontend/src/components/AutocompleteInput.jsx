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
    maxResults = 8,
    allowCustomInput = true, // Дозволити вільний ввід, якщо опції не знайдено
    disabled = false // Заблокувати інпут
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState([]);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Відсортувати опції: спочатку популярні, потім за релевантністю
    useEffect(() => {
        if (disabled) {
            setFilteredOptions([]);
            setIsOpen(false);
            return;
        }
        
        if (!searchTerm.trim()) {
            // Якщо немає пошуку, показуємо популярні (3 для кафедр, 5 для університетів)
            const popularCount = maxResults <= 8 ? 3 : 5; // Для кафедр показуємо 3 найчастіші
            const popular = options.filter(opt => opt.popular).slice(0, showPopular ? popularCount : 0);
            setFilteredOptions(popular);
        } else {
            // Фільтруємо та сортуємо за релевантністю (популярні не показуються, якщо не співпадають)
            const term = searchTerm.toLowerCase();
            const filtered = options
                .filter(opt => {
                    const name = opt.name.toLowerCase();
                    const shortName = opt.shortName?.toLowerCase() || '';
                    // Фільтруємо тільки ті, що співпадають з пошуком
                    return name.includes(term) || shortName.includes(term);
                })
                .sort((a, b) => {
                    // Сортуємо за початком збігу (не за популярністю, якщо є пошук)
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
    }, [searchTerm, options, showPopular, maxResults, disabled]);

    // Оновити searchTerm коли змінюється value (ззовні)
    useEffect(() => {
        if (value) {
            setSearchTerm(value);
        } else if (!isOpen && !searchTerm) {
            setSearchTerm('');
        }
    }, [value]);

    const handleInputChange = (e) => {
        if (disabled) return;
        
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setIsOpen(true);
        
        // Якщо поле очищено, очистити значення
        if (!newValue.trim()) {
            onChange('');
        }
    };

    const handleSelect = (option) => {
        if (disabled) return;
        
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
        if (disabled) return;
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

    const baseInputClasses = className || 'w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 text-gray-800 focus:outline-none transition-all duration-300 pr-14 overflow-hidden text-ellipsis whitespace-nowrap';
    const inputClasses = error
        ? `${baseInputClasses} border border-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]`
        : disabled
            ? `${baseInputClasses} border border-gray-500 opacity-50 cursor-not-allowed`
            : searchTerm.trim() || isOpen
                ? `${baseInputClasses} border border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] focus:border-blue-400 focus:shadow-[0_0_12px_rgba(59,130,246,0.6)]`
                : `${baseInputClasses} border border-gray-500`;

    const handleDisabledClick = (e) => {
        if (disabled) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={disabled ? undefined : handleFocus}
                    onBlur={handleBlur}
                    onClick={handleDisabledClick}
                    disabled={disabled}
                    className={inputClasses}
                    placeholder={placeholder}
                    readOnly={disabled}
                    title={searchTerm || placeholder}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="group"
                        >
                            <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:rotate-90 transition-transform duration-300" />
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
                    className={`autocomplete-dropdown-wrapper absolute z-50 w-full mt-2 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden ${
                        filteredOptions.length > 3 ? 'always-show-scrollbar' : 'overflow-y-auto max-h-64'
                    }`}
                    style={filteredOptions.length > 3 ? { height: '16rem', overflowY: 'scroll' } : { maxHeight: '16rem' }}
                >
                    {filteredOptions.map((option, index) => (
                        <button
                            key={option.id || index}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className="autocomplete-option w-full px-4 py-3 text-left transition-all duration-300 border-b-2 border-gray-600/50 last:border-b-0 group bg-gray-800 hover:bg-gray-700 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                            style={{
                                animationDelay: `${index * 20}ms`
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 transition-all duration-300 bg-gray-500 group-hover:bg-blue-500 group-hover:shadow-[0_0_6px_rgba(59,130,246,0.5)] group-hover:scale-150"></div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm leading-tight transition-colors duration-300 text-white group-hover:text-blue-200">
                                        {option.name}
                                    </div>
                                    {option.shortName && option.shortName !== option.name && (
                                        <div className="text-xs mt-1.5 font-medium transition-colors duration-300 text-gray-400 group-hover:text-blue-300">
                                            {option.shortName}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && searchTerm.trim() && filteredOptions.length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-white font-semibold text-sm">Нічого не знайдено</p>
                        <p className="text-xs text-gray-400 mt-1">Спробуйте інший запит</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutocompleteInput;

