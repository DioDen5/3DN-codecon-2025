import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { logout } from '../api/auth';

const Header = ({ onLoginOpen, onSignupOpen }) => {
    const { isAuth, user, logoutLocal } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (_) {}
        logoutLocal();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 backdrop-blur bg-black/30">
            <div className="max-w-6xl mx-auto px-4 h-[68px] flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/vite.svg" alt="logo" className="w-6 h-6" />
                    <span className="text-white text-xl font-semibold">StudLink</span>
                </Link>

                <nav className="flex items-center gap-6 text-white/90">
                    <Link to="/" className="hover:text-white">Головна</Link>
                    <Link to="/teachers" className="hover:text-white">Рейтинг викладачів</Link>
                    <Link to="/forum" className="hover:text-white">Форум</Link>
                </nav>

                {!isAuth ? (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onLoginOpen}
                            className="px-4 py-2 rounded-md bg-white/20 text-white hover:bg-white/30"
                        >
                            Увійти
                        </button>
                        <button
                            onClick={onSignupOpen}
                            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Реєстрація
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
            <span className="text-white/90 hidden sm:block">
              {user?.displayName || 'Користувач'}
            </span>
                        <button
                            onClick={() => navigate('/forum/create')}
                            className="px-3 py-2 rounded-md bg-white/10 text-white hover:bg-white/20"
                        >
                            + Створити
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                        >
                            Вийти
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
