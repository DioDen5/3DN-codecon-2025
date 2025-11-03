import React from 'react';
import { X, CheckCircle, XCircle, GraduationCap, Building2, BookOpen, User, Smartphone, Image, FileText, Award } from 'lucide-react';

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
    const c = item?.pendingChanges || {};
    const orig = item || {};

    const isChanged = (key, formatter) => {
        if (!(key in c)) return false;
        const a = formatter ? formatter(c[key]) : c[key];
        const b = formatter ? formatter(orig[key]) : orig[key];
        return JSON.stringify(a) !== JSON.stringify(b);
    };

    const subjectsToString = (arr) => Array.isArray(arr) ? arr.filter(Boolean).join(', ') : (arr || '');
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative w-[95vw] max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow">
                            <User size={18} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Запит на зміну профілю</div>
                            <div className="text-base font-bold text-gray-900">{item?.name || 'Викладач'}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 active:bg-blue-200 transition-colors group" aria-label="Закрити">
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className={`p-3 rounded-xl border ${isChanged('bio') ? 'border-yellow-300 bg-yellow-50 text-yellow-800' : 'border-gray-200 bg-gray-50 text-gray-800'} text-sm leading-relaxed whitespace-pre-wrap`}>
                            {(c.bio ?? orig.bio) || '—'}
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-gray-200 bg-white flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Скасувати</button>
                    <button onClick={() => onReject(item._id)} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"><XCircle size={16} /> Відхилити</button>
                    <button onClick={() => onApprove(item._id)} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"><CheckCircle size={16} /> Схвалити</button>
                </div>
            </div>
        </div>
    );
};

export default TeacherChangeReviewModal;


