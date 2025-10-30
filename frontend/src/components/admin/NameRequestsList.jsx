import React from 'react';
import { UserRound } from 'lucide-react';

const NameRequestsList = ({ nameRequests = [], onApprove = () => {}, onReject = () => {} }) => {
    if (!nameRequests || nameRequests.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 animate-[slideInFromLeft_0.6s_ease-out_both]">
                <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 review-icon-glow review-icon-pulse review-icon-rotate relative overflow-hidden" style={{ background: '#60A5FA' }}>
                        <div className="absolute inset-0 review-icon-shimmer" style={{background: 'rgba(96,165,250,0.28)'}}></div>
                        <UserRound className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                        <div className="absolute inset-0" style={{background: 'radial-gradient(rgba(255,255,255,0.12) 55%, transparent 100%)'}}></div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Зміна імені</h4>
                    <p className="text-gray-600">Немає запитів на зміну імені</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-2xl font-semibold mb-1">Заявки на зміну імені</div>
            <div className="text-gray-600 mb-6">Тут ви можете розглядати запити студентів на зміну імені. Підтверджений запит оновить дані в акаунті.</div>

            {nameRequests.map((req) => (
                <div
                    key={req._id || req.id}
                    className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 animate-[slideInFromLeft_0.6s_ease-out_both]"
                >
                    <div className="flex items-start justify-between gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-8 gap-y-3 w-full">
                            <div className="text-gray-700 font-medium">Користувач:</div>
                            <div className="text-gray-900 break-words">
                                {req.userId?.displayName || req.userId?.email || req.userDisplayName || '—'}
                            </div>

                            <div className="text-gray-700 font-medium">Поточне ім'я:</div>
                            <div className="text-gray-900 break-words">
                                {(req.currentFirstName || '') + ' ' + (req.currentLastName || '')}
                            </div>

                            <div className="text-gray-700 font-medium">Нове ім'я:</div>
                            <div className="text-gray-900 break-words">{req.newFirstName || '—'}</div>

                            <div className="text-gray-700 font-medium">Нове прізвище:</div>
                            <div className="text-gray-900 break-words">{req.newLastName || '—'}</div>

                            {req.newMiddleName ? (
                                <>
                                    <div className="text-gray-700 font-medium">По батькові:</div>
                                    <div className="text-gray-900 break-words">{req.newMiddleName}</div>
                                </>
                            ) : null}

                            {(
                                <>
                                    <div className="text-gray-700 font-medium">Причина:</div>
                                    <div className="text-gray-900/80 break-words">{req.reason || '—'}</div>
                                </>
                            )}
                        </div>

                        <div className="text-xs text-gray-400 whitespace-nowrap ml-auto pl-2 pt-1">
                            Створено: {req.createdAt ? new Date(req.createdAt).toLocaleDateString('uk-UA') : '—'}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                        <button
                            className="px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium transition-colors shadow-sm active:scale-[0.98]"
                            onClick={() => onApprove(req._id || req.id)}
                        >
                            Підтвердити
                        </button>
                        <button
                            className="px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-colors shadow-sm active:scale-[0.98]"
                            onClick={() => onReject(req._id || req.id)}
                        >
                            Відхилити
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NameRequestsList;
