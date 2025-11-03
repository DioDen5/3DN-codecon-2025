import React, { useState } from 'react';
import { GraduationCap, Mail, Eye } from 'lucide-react';
import TeacherVerificationModal from './TeacherVerificationModal';

const Item = ({ t, onApprove, onReject }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <div className="rounded-xl p-4 border transition-all duration-500 ease-out relative bg-gray-50 border-gray-200 hover:moderation-glow" style={{ animation: 'slideInFromLeft 0.6s ease-out both' }}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">Запит на верифікацію профілю</div>
                                <div className="text-sm text-gray-600">
                                    {t.name} • {t.userId?.email || '—'}
                                    {t.createdAt && (
                                        <span className="text-gray-500"> • {new Date(t.createdAt).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {t.university && (
                                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-800">
                                    <span className="text-[10px] uppercase tracking-wide text-gray-500">Університет:</span>
                                    <span className="font-medium">{t.university}</span>
                                </span>
                            )}
                            {t.faculty && (
                                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-800">
                                    <span className="text-[10px] uppercase tracking-wide text-gray-500">Факультет:</span>
                                    <span className="font-medium">{t.faculty}</span>
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setOpen(true)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 hover:shadow-lg hover:shadow-blue-300/50 active:scale-95 active:shadow-inner transition-all duration-300 cursor-pointer flex items-center gap-1">
                                <Eye className="w-4 h-4" /> Переглянути
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {open && (
                <TeacherVerificationModal
                    item={t}
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    onApprove={(id) => { setOpen(false); onApprove?.(id); }}
                    onReject={(id, reason) => { setOpen(false); onReject?.(id, reason); }}
                />
            )}
        </>
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


