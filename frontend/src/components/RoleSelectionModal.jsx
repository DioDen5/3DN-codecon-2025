import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, GraduationCap, User } from 'lucide-react';

const RoleSelectionModal = ({ isOpen, onClose, onSelectRole }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                    duration: 0.3,
                    ease: "easeOut",
                }}
                className="bg-white/40 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
            >
                <div className="p-6 border-b border-white/20 relative">
                    <button
                        onClick={onClose}
                        className="cursor-pointer absolute right-4 top-4"
                    >
                        <div className="group flex items-center justify-center w-8 h-8 rounded-full bg-white/60 hover:cursor-pointer">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-6 h-6 text-black group-hover:text-gray-600"
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
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Оберіть тип акаунта</h2>
                    </div>
                    <p className="text-sm text-white/80 mt-2">Виберіть роль для реєстрації</p>
                </div>

                <div className="p-6 space-y-4">
                    <button
                        onClick={() => onSelectRole('student')}
                        className="w-full p-6 rounded-xl border-2 border-white/30 hover:border-blue-400 hover:bg-blue-500/20 transition-all group cursor-pointer bg-white/10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="font-semibold text-white text-lg">Студент</h3>
                                <p className="text-sm text-white/80">Реєстрація для студентів університету</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelectRole('teacher')}
                        className="w-full p-6 rounded-xl border-2 border-white/30 hover:border-indigo-400 hover:bg-indigo-500/20 transition-all group cursor-pointer bg-white/10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="font-semibold text-white text-lg">Викладач</h3>
                                <p className="text-sm text-white/80">Реєстрація для викладачів університету</p>
                            </div>
                        </div>
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default RoleSelectionModal;

