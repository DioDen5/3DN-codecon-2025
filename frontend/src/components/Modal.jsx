import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

const Modal = ({ isOpen, onClose, children }) => {

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            return () => {
                document.body.style.overflow = ''
            }
        } else {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                    duration: 0.3,
                    ease: "easeOut",
                }}
                className="bg-white/40 backdrop-blur-md rounded-4xl shadow-2xl w-full max-w-xl p-1 relative"
            >
                <button
                    onClick={onClose}
                    className="cursor-pointer"
                >
                    <div
                        className="group absolute right-4 top-4 flex items-center justify-center w-8 h-8 rounded-full bg-white/60 hover:cursor-pointer"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 text-black group-hover:text-gray-600 group-hover:rotate-90 transition-transform duration-300"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </div>
                </button>
                {children}
            </motion.div>
        </div>
    )
}

export default Modal
