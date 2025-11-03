import React, { useState } from 'react';
import { User, GraduationCap, Building2, BookOpen } from 'lucide-react';
import TeacherChangeReviewModal from './TeacherChangeReviewModal';

const Row = ({ item, onApprove, onReject }) => {
    const [open, setOpen] = useState(false);
    const changes = item?.pendingChanges || {};
    return (
        <>
            <div className="rounded-xl p-4 border transition-all duration-500 ease-out relative bg-white border-gray-200 hover:shadow-md" style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                            <User size={16} /> {item?.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            {changes.university && (
                                <span className="inline-flex items-center gap-1"><GraduationCap size={14} />{changes.university}</span>
                            )}
                            {changes.faculty && (
                                <span className="inline-flex items-center gap-1"><Building2 size={14} />{changes.faculty}</span>
                            )}
                            {changes.department && (
                                <span className="inline-flex items-center gap-1"><BookOpen size={14} />{changes.department}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setOpen(true)} className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">Детальніше</button>
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


