import React from 'react';
import { UserRound } from 'lucide-react';

const MOCK_REQUESTS = [];

const NameRequestsList = () => {
    const requests = MOCK_REQUESTS;

    if (!requests || requests.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden" style={{ background: '#57A9FB' }}>
                        <div className="absolute inset-0 namechange-icon-shimmer opacity-30"></div>
                        <UserRound className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
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
            <div className="text-gray-600 mb-6">
                Тут ви можете розглядати запити студентів на зміну імені, прізвища або по батькові. Підтверджений запит оновить ці дані в акаунті студенту.
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-100 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                <div className="flex-1 space-y-2">
                    <div><span className="font-medium text-gray-700">Поточне ім'я:</span> Student</div>
                    <div><span className="font-medium text-gray-700">Нове ім'я:</span> Андрій</div>
                    <div><span className="font-medium text-gray-700">Нове прізвище:</span> Бондаренко</div>
                    <div><span className="font-medium text-gray-700">По батькові:</span> Михайлович</div>
                    <div><span className="font-medium text-gray-700">Причина:</span> Помилка при реєстрації</div>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <button className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition">Підтвердити</button>
                    <button className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition">Відхилити</button>
                </div>
                <div className="text-xs text-gray-400 mt-2 md:mt-0 md:text-right">Створено: 30.10.2025</div>
            </div>
        </div>
    );
}

export default NameRequestsList;
