import React, { useState } from 'react';
import { User, GraduationCap, Building2, BookOpen } from 'lucide-react';
import TeacherChangeReviewModal from './TeacherChangeReviewModal';

const Row = ({ item, onApprove, onReject }) => {
    const [open, setOpen] = useState(false);
    const changes = item?.pendingChanges || {};
    return (
        <>
            <div className="rounded-xl p-4 border transition-all duration-500 ease-out relative bg-gray-50 border-gray-200 hover:moderation-glow" style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">Запит на редагування профілю</div>
                                <div className="text-sm text-gray-600">Викладач: {item?.name} • {item?.lastEditedAt ? new Date(item.lastEditedAt).toLocaleDateString('uk-UA') : ''}</div>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-3">
                            <span className="font-medium">Ключові зміни:</span>
                            {changes.position && <span> посада</span>}
                            {changes.university && <span>, університет</span>}
                            {changes.faculty && <span>, факультет</span>}
                            {changes.department && <span>, кафедра</span>}
                            {Array.isArray(changes.subjects) && changes.subjects.length > 0 && <span>, предмети</span>}
                            {changes.bio && <span>, біографія</span>}
                            {changes.image && <span>, фото</span>}
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setOpen(true)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 hover:shadow-lg hover:shadow-blue-300/50 active:scale-95 active:shadow-inner transition-all duration-300 cursor-pointer">Переглянути</button>
                        </div>
                    </div>
                </div>
            </div>
            {open && (
                <TeacherChangeReviewModal
                    item={item}
                    onClose={() => setOpen(false)}
                    onApprove={(id) => { setOpen(false); onApprove(id); }}
                    onReject={(id) => { setOpen(false); onReject(id); }}
                />
            )}
        </>
    );
};

const TeacherPendingChangesList = ({ items = [], onApprove, onReject }) => {
    if (!items || items.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 text-gray-600">Немає змін, що очікують модерації.</div>
        );
    }
    return (
        <div className="space-y-3">
            {items.map((item) => (
                <Row key={item._id} item={item} onApprove={onApprove} onReject={onReject} />
            ))}
        </div>
    );
};

export default TeacherPendingChangesList;


