import React, { useState } from 'react';
import { 
    Shield, 
    Lock
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

    return (
        <div className="space-y-6 settings-slide-in">
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100/50 to-red-200/30 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        Налаштування безпеки
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-red-600" />
                                <div>
                                    <div className="font-medium text-gray-900">Двофакторна автентифікація</div>
                                    <div className="text-sm text-gray-600">Додатковий рівень безпеки для адміністраторів</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => toggleSetting('twoFactor')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                                    settings.twoFactor ? 'bg-red-600' : 'bg-gray-300'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                    settings.twoFactor ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Таймаут сесії (хвилини)</label>
                                <input 
                                    type="number" 
                                    value={settings.sessionTimeout}
                                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Максимум спроб входу</label>
                                <input 
                                    type="number" 
                                    value={settings.maxLoginAttempts}
                                    onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;