import React from 'react';
import { CheckCircle, XCircle, User, GraduationCap, Building2, BookOpen, FileText } from 'lucide-react';

const Row = ({ item, onApprove, onReject }) => {
    const changes = item?.pendingChanges || {};
    const field = (label, value) => (
        <div className="flex items-center gap-2 text-sm"><span className="text-gray-500">{label}:</span><span className="font-medium">{value || '—'}</span></div>
    );
    return (
        <div className="rounded-xl p-4 border transition-all duration-500 ease-out relative bg-gray-50 border-gray-200 hover:moderation-glow" style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                        <User size={16} /> {item?.name}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {changes.position && field('Посада', changes.position)}
                        {changes.university && (
                            <div className="flex items-center gap-2 text-sm"><GraduationCap size={16} /><span className="font-medium">{changes.university}</span></div>
                        )}
                        {changes.faculty && (
                            <div className="flex items-center gap-2 text-sm"><Building2 size={16} /><span className="font-medium">{changes.faculty}</span></div>
                        )}
                        {changes.department && (
                            <div className="flex items-center gap-2 text-sm"><BookOpen size={16} /><span className="font-medium">{changes.department}</span></div>
                        )}
                        {Array.isArray(changes.subjects) && changes.subjects.length > 0 && field('Предмети', changes.subjects.join(', '))}
                        {changes.bio && (
                            <div className="flex items-center gap-2 text-sm"><FileText size={16} /><span className="font-medium line-clamp-2" title={changes.bio}>{changes.bio}</span></div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onApprove(item._id)} className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer flex items-center gap-2">
                        <CheckCircle size={16} /> Схвалити
                    </button>
                    <button onClick={() => onReject(item._id)} className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-2">
                        <XCircle size={16} /> Відхилити
                    </button>
                </div>
            </div>
        </div>
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


