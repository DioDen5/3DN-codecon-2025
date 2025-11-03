import React, { useState } from 'react';
import { CheckCircle, XCircle, GraduationCap, Mail } from 'lucide-react';

const Item = ({ t, onApprove, onReject }) => {
    const [reason, setReason] = useState('');
    return (
        <div className="rounded-xl p-4 border transition-all duration-500 ease-out relative bg-gray-50 border-gray-200 hover:moderation-glow" style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                        <GraduationCap size={16} /> {t.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} /> {t.userId?.email || '—'}
                    </div>
                    <div className="text-xs text-gray-500">Університет: {t.university || '—'} | Факультет: {t.faculty || '—'}</div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onApprove(t._id)} className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer flex items-center gap-2">
                        <CheckCircle size={16} /> Схвалити
                    </button>
                    <input
                        value={reason}
                        onChange={(e)=>setReason(e.target.value)}
                        placeholder="Причина відхилення"
                        className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button onClick={() => onReject(t._id, reason)} className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-2">
                        <XCircle size={16} /> Відхилити
                    </button>
                </div>
            </div>
        </div>
    );
};

const TeacherVerificationList = ({ items = [], onApprove, onReject }) => {
    if (!items || items.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 text-gray-600">Немає профілів викладачів, що очікують верифікації.</div>
        );
    }
    return (
        <div className="space-y-3">
            {items.map((t) => (
                <Item key={t._id} t={t} onApprove={onApprove} onReject={onReject} />
            ))}
        </div>
    );
};

export default TeacherVerificationList;


