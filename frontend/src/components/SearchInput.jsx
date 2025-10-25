import React from 'react'
import { FaSearch } from 'react-icons/fa'

const SearchInput = ({ placeholder = 'Пошук', value, onChange, whiteTheme = false }) => {
    if (whiteTheme) {
        return (
            <div className="flex items-center justify-center w-full relative">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full pl-4 pr-10 py-2 rounded-xl bg-white text-gray-800 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all duration-300"
                />
                <FaSearch className="absolute right-3 text-gray-500 w-4 h-4" />
            </div>
        )
    }
    
    return (
        <div className="flex items-center justify-center w-full relative">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full pl-4 pr-10 py-2 rounded-md bg-white/10 text-white placeholder-gray-300 border border-white/10 focus:outline-none focus:ring-[0.5px] focus:ring-white"
            />
            <FaSearch className="absolute right-3 text-white w-4 h-4" />
        </div>
    )
}

export default SearchInput