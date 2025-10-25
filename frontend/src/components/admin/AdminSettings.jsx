import React, { useState } from 'react';
import { 
    Shield, 
    Lock,
    Clock,
    UserX,
    Save,
    AlertTriangle
} from 'lucide-react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        twoFactor: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5
    });

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Симуляція збереження налаштувань
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 settings-slide-in">
            <div className="bg-white text-black rounded-2xl p-8 shadow-xl border border-gray-200 relative overflow-hidden group">
                {/* Анімований фон */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-100/40 to-red-200/20 rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100/30 to-blue-200/20 rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
                
                <div className="relative">
                    {/* Заголовок з анімацією */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 security-icon-glow security-icon-pulse security-icon-rotate security-icon-shimmer relative overflow-hidden">
                                <Shield className="w-5 h-5 text-white relative z-10" />
                            </div>
                            Налаштування безпеки
                        </h3>
                        <p className="text-gray-600 text-sm">Керування параметрами безпеки системи</p>
                    </div>
                    
                    <div className="space-y-8">
                        {/* Двофакторна автентифікація */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group/setting">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md group-hover/setting:scale-105 transition-transform duration-300">
                                        <Lock className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 text-lg">Двофакторна автентифікація</div>
                                        <div className="text-sm text-gray-600 mt-1">Додатковий рівень безпеки для адміністраторів</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => toggleSetting('twoFactor')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 shadow-md hover:shadow-lg cursor-pointer overflow-hidden ${
                                        settings.twoFactor 
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-200' 
                                            : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                >
                                    {/* Рідкий ефект заповнення */}
                                    <div className={`absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500 ${
                                        settings.twoFactor 
                                            ? 'translate-x-0 opacity-100 liquid-fill' 
                                            : 'translate-x-[-100%] opacity-0'
                                    }`}></div>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-200 active:scale-95 active:rounded-3xl active:h-3.5 active:w-4.5 hover:liquid-bounce ${
                                        settings.twoFactor ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                        </div>

                        {/* Налаштування */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Таймаут сесії */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group/input">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover/input:scale-105 transition-transform duration-300">
                                        <Clock className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900">Таймаут сесії</label>
                                        <p className="text-xs text-gray-500">Час до автоматичного виходу (хвилини)</p>
                                    </div>
                                </div>
                                <input 
                                    type="number" 
                                    min="5"
                                    max="480"
                                    value={settings.sessionTimeout}
                                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg font-medium focus:security-input-focus"
                                />
                            </div>

                            {/* Максимум спроб входу */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group/input">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover/input:scale-105 transition-transform duration-300">
                                        <UserX className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900">Максимум спроб входу</label>
                                        <p className="text-xs text-gray-500">Кількість невдалих спроб до блокування</p>
                                    </div>
                                </div>
                                <input 
                                    type="number" 
                                    min="3"
                                    max="10"
                                    value={settings.maxLoginAttempts}
                                    onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-lg font-medium focus:security-input-focus"
                                />
                            </div>
                        </div>

                        {/* Кнопка збереження */}
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                    isSaving 
                                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                                        : saveSuccess
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-200 security-save-success'
                                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-200 hover:scale-105'
                                }`}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Збереження...
                                    </>
                                ) : saveSuccess ? (
                                    <>
                                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        </div>
                                        Збережено!
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Зберегти налаштування
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;