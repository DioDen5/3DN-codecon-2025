import React from 'react';

const ModerationHeader = ({ moderationData }) => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 moderation-slide-in">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Модерація контенту</h3>
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
    );
};

export default ModerationHeader;
