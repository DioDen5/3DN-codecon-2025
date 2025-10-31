import React from 'react';
import { X, GraduationCap, User } from 'lucide-react';

const RoleSelectionModal = ({ isOpen, onClose, onSelectRole }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[slideInFromLeft_0.3s_ease-out]">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Оберіть тип акаунта</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Виберіть роль для реєстрації</p>
                </div>

                <div className="p-6 space-y-4">
                    <button
                        onClick={() => onSelectRole('student')}
                        className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg">Студент</h3>
                                <p className="text-sm text-gray-600">Реєстрація для студентів університету</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelectRole('teacher')}
                        className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg">Викладач</h3>
                                <p className="text-sm text-gray-600">Реєстрація для викладачів університету</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionModal;

