import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyResetToken } from '../api/auth';

const ResetPasswordVerifyPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [verified, setVerified] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const verifyToken = async () => {
            try {
                const data = await verifyResetToken(token);
                setUserInfo(data);
                setVerified(true);
            } catch (error) {
                console.error('Verify token error:', error);
                setError(error.response?.data?.error || 'Недійсний або прострочений токен');
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token, navigate]);

    const handleContinue = () => {
        navigate(`/reset-password?token=${token}`);
    };

    if (!token) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/40 backdrop-blur-md rounded-4xl shadow-2xl w-full max-w-xl p-1 relative">
                <div className="w-full h-full flex items-center justify-center p-10">
                    <div className="w-full max-w-md text-white flex flex-col items-center space-y-5 text-center">
                        {loading ? (
                            <>
                                <h2 className="text-3xl font-semibold">Перевірка токену</h2>
                                <p className="text-white/80 text-md">
                                    Будь ласка, зачекайте...
                                </p>
                                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            </>
                        ) : error ? (
                            <>
                                <h2 className="text-3xl font-semibold">Помилка</h2>
                                <div className="w-full p-3 bg-red-500/20 border border-red-400/40 rounded-lg text-red-300 text-sm">
                                    {error}
                                </div>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-sm text-indigo-300 hover:underline cursor-pointer"
                                >
                                    Повернутись до входу
                                </button>
                            </>
                        ) : verified ? (
                            <>
                                <h2 className="text-3xl font-semibold">Підтвердження успішне</h2>
                                <p className="text-white/80 text-md">
                                    Ви успішно підтвердили запит на відновлення пароля{userInfo?.displayName ? `, ${userInfo.displayName}` : ''}.
                                </p>
                                <div className="w-full p-3 bg-green-500/20 border border-green-400/40 rounded-lg text-green-300 text-sm">
                                    Тепер ви можете встановити новий пароль
                                </div>
                                <button
                                    onClick={handleContinue}
                                    className="w-full p-2 rounded-lg mt-2 text-white bg-blue-700 hover:bg-blue-800 cursor-pointer transition"
                                >
                                    Перейти до введення нового пароля
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-sm text-indigo-300 hover:underline cursor-pointer"
                                >
                                    Повернутись до входу
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordVerifyPage;

