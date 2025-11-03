import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, XCircle, GraduationCap, Building2, BookOpen, User, Smartphone, Image, FileText, Award, Mail } from 'lucide-react';

const Row = ({ label, value, icon: Icon, changed = false }) => {
    const valueClass = changed ? 'text-yellow-700' : 'text-gray-900';
    const chipClass = changed ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200';
    return (
        <div className="flex items-start gap-3 py-2">
            {Icon && (
                <div className={`w-7 h-7 rounded-lg ${changed ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                    {label}
                    {changed && <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-semibold border ${chipClass}">змінено</span>}
                </div>
                <div className={`text-sm font-semibold break-words ${valueClass}`}>{value || '—'}</div>
            </div>
        </div>
    );
};

const TeacherChangeReviewModal = ({ item, onClose, onApprove, onReject }) => {
    const [isClosing, setIsClosing] = useState(false);
    useEffect(() => {
        // Блокуємо прокрутку під час відкритої модалки
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose?.();
        }, 300);
    };
    const c = item?.pendingChanges || {};
    const orig = item || {};
    const email = item?.email || item?.userId?.email || '';

    const isChanged = (key, formatter) => {
        if (!(key in c)) return false;
        const a = formatter ? formatter(c[key]) : c[key];
        const b = formatter ? formatter(orig[key]) : orig[key];
        return JSON.stringify(a) !== JSON.stringify(b);
    };

    const subjectsToString = (arr) => Array.isArray(arr) ? arr.filter(Boolean).join(', ') : (arr || '');
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
                            <div className="text-sm text-gray-500">Запит на зміну профілю</div>
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
                    <div className="flex items-center gap-3">
                        <button onClick={handleClose} className="p-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 active:bg-blue-200 transition-colors group" aria-label="Закрити">
                            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Row label="Посада" value={c.position ?? orig.position} icon={Award} changed={isChanged('position')} />
                    <Row label="Телефон" value={(c.phone ?? orig.phone) || 'не вказано'} icon={Smartphone} changed={isChanged('phone')} />
                    <Row label="Університет" value={c.university ?? orig.university} icon={GraduationCap} changed={isChanged('university')} />
                    <Row label="Факультет" value={c.faculty ?? orig.faculty} icon={Building2} changed={isChanged('faculty')} />
                    <Row label="Кафедра" value={c.department ?? orig.department} icon={BookOpen} changed={isChanged('department')} />
                    <Row label="Предмети" value={subjectsToString(c.subjects ?? orig.subjects)} icon={BookOpen} changed={isChanged('subjects', subjectsToString)} />

                    <div className="md:col-span-2">
                        <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                            <Image size={16} /> Фото {isChanged('image') && <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-semibold border bg-yellow-50 border-yellow-200 text-yellow-700">змінено</span>}
                        </div>
                        <div className={`rounded-xl overflow-hidden border ${isChanged('image') ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'} p-3`}>
                            <img src={(c.image ?? orig.image) || ''} alt="teacher" className="max-h-56 object-contain mx-auto" />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                            <FileText size={16} /> Біографія {isChanged('bio') && <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-semibold border bg-yellow-50 border-yellow-200 text-yellow-700">змінено</span>}
                        </div>
                        <div className={`p-3 rounded-xl border ${isChanged('bio') ? 'border-yellow-300 bg-yellow-50 text-yellow-800' : 'border-gray-200 bg-gray-50 text-gray-800'} text-sm leading-relaxed whitespace-pre-wrap max-h-56 overflow-auto`}>
                            {(c.bio ?? orig.bio) || '—'}
                        </div>
                    </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center justify-between gap-3 sticky bottom-0 z-10">
                    <div className="flex gap-3">
                        <button onClick={() => onReject(item._id)} className="flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-300 rounded-lg text-red-700 font-medium hover:bg-red-200 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer">
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
        </div>,
        document.body
    );
};

export default TeacherChangeReviewModal;



