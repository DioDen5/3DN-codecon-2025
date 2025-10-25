import React from 'react';
import { Eye } from 'lucide-react';

const ModerationHeader = ({ moderationData }) => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 moderation-slide-in relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-indigo-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 moderation-icon-glow moderation-icon-pulse moderation-icon-rotate moderation-icon-shimmer relative overflow-hidden">
                                <Eye className="w-5 h-5 text-white relative z-10" />
                            </div>
                            Модерація контенту
                        </h3>
                        <p className="text-gray-600">Управління якістю контенту на платформі</p>
                    </div>
                    <div className="flex gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{moderationData?.announcements || 0}</div>
                        <div className="text-sm text-gray-600">Обговорень</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{moderationData?.comments || 0}</div>
                        <div className="text-sm text-gray-600">Коментарів</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{moderationData?.reviews || 0}</div>
                        <div className="text-sm text-gray-600">Відгуків</div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default ModerationHeader;
