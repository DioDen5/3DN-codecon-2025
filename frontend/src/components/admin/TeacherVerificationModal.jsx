import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Mail, GraduationCap, Building2, BookOpen, Award, Smartphone, Image, FileText, CheckCircle, XCircle } from 'lucide-react';

const Row = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 py-2">
        {Icon && (
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Icon size={16} />
            </div>
        )}
        <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-sm font-semibold text-gray-900 break-words">{value || '—'}</div>
        </div>
    </div>
);

const RejectReasonModal = ({ isOpen, onClose, onSubmit }) => {
    const [value, setValue] = useState('');
    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-[92vw] max-w-md bg-white rounded-xl border border-gray-200 shadow-2xl ring-1 ring-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Причина відхилення</h3>
                    <button onClick={onClose} className="p-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <textarea value={value} onChange={e=>setValue(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 resize-none" placeholder="Коротко опишіть причину..." />
                <div className="flex items-center justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">Скасувати</button>
                    <button onClick={()=>{ if (value.trim()) { onSubmit(value.trim()); } }} disabled={!value.trim()} className={`px-3 py-2 rounded-lg text-white transition-colors ${value.trim() ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'}`}>Відхилити</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const TeacherVerificationModal = ({ item, isOpen, onClose, onApprove, onReject }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [showReject, setShowReject] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen || !item) return null;

    const email = item?.userId?.email || item?.email || '';

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose?.();
        }, 300);
    };

    return createPortal(
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isClosing ? 'modal-closing' : 'report-backdrop-animate'}`}>
            <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${isClosing ? '' : 'report-backdrop-animate'}`} onClick={handleClose} />
            <div className={`relative w-[94vw] max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 ${isClosing ? 'modal-closing' : 'report-modal-animate'} ring-1 ring-white/10 shadow-[0_0_108px_22px_rgba(37,99,235,0.25)] max-h-[88vh] overflow-y-auto`}>
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow">
                            <User size={18} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm text-gray-500">Запит на верифікацію профілю</div>
                            <div className="text-base font-bold text-gray-900 whitespace-normal break-words flex items-center gap-2">
                                <span>{item?.name || 'Викладач'}</span>
                                {email && (
                                    <span className="text-sm font-medium text-blue-700 break-all flex items-center gap-1">
                                        <span className="text-gray-400">—</span>
                                        <Mail size={14} />
                                        {email}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 active:bg-blue-200 transition-colors group" aria-label="Закрити">
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Row label="Посада" value={item.position} icon={Award} />
                    <Row label="Телефон" value={item.phone || 'не вказано'} icon={Smartphone} />
                    <Row label="Університет" value={item.university} icon={GraduationCap} />
                    <Row label="Факультет" value={item.faculty} icon={Building2} />
                    <Row label="Кафедра" value={item.department} icon={BookOpen} />
                    <Row label="Предмети" value={(Array.isArray(item.subjects) && item.subjects.join(', ')) || item.subject || '—'} icon={BookOpen} />

                    {item.image && (
                        <div className="md:col-span-2">
                            <div className="text-xs text-gray-500 mb-2 flex items-center gap-2"><Image size={16} /> Фото</div>
                            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-3">
                                <img src={item.image} alt="teacher" className="max-h-56 object-contain mx-auto" />
                            </div>
                        </div>
                    )}

                    <div className="md:col-span-2">
                        <div className="text-xs text-gray-500 mb-2 flex items-center gap-2"><FileText size={16} /> Біографія</div>
                        <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap max-h-56 overflow-auto">
                            {item.bio || '—'}
                        </div>
                    </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center justify-between gap-3 sticky bottom-0 z-10">
                    <div className="flex gap-3">
                        <button onClick={() => setShowReject(true)} className="flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-300 rounded-lg text-red-700 font-medium hover:bg-red-200 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer">
                            Відхилити
                        </button>
                        <button onClick={() => onApprove(item._id)} className="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-green-700 font-medium hover:bg-green-200 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer">
                            Схвалити
                        </button>
                    </div>
                    <button onClick={handleClose} className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-200 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer">
                        Скасувати
                    </button>
                </div>
            </div>
            <RejectReasonModal
                isOpen={showReject}
                onClose={() => setShowReject(false)}
                onSubmit={(reason) => { setShowReject(false); onReject?.(item._id, reason); }}
            />
        </div>,
        document.body
    );
};

export default TeacherVerificationModal;


