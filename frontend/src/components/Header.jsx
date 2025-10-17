import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { UserRound } from "lucide-react";
import { useAuthState } from "../api/useAuthState";
import { logout } from "../api/auth";

const Header = ({ onLoginOpen, onSignupOpen }) => {
    const nav = useNavigate();
    const { isAuthed, user } = useAuthState();

    const handleLogout = async () => {
        await logout();
        nav("/");
    };

    return (
        <header className="w-full bg-black px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="StudLink Logo" className="h-8 w-auto object-contain" />
                </Link>

                <nav className="flex items-center gap-6 text-xs mx-8">
                    <Link to="/" className="text-white hover:text-pink-400 transition">Головна</Link>
                    <Link to="/teachers" className="text-white hover:text-pink-400 transition">Рейтинг викладачів</Link>
                    <Link to="/forum" className="text-white hover:text-pink-400 transition">Форум</Link>
                </nav>
            </div>

            {!isAuthed ? (
                <div className="flex items-center gap-3">
                    <button
                        onClick={onLoginOpen}
                        className="px-4 py-1.5 min-w-[80px] rounded-md bg-blue-200 text-blue-600 font-medium hover:bg-gray-100 transition"
                    >
                        Увійти
                    </button>
                    <button
                        onClick={onSignupOpen}
                        className="px-4 py-1.5 min-w-[80px] rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                    >
                        Реєстрація
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    {/* акуратна іконка користувача замість тексту */}
                    <div
                        title={user?.displayName || "Користувач"}
                        className="h-8 w-8 rounded-full bg-white/10 border border-white/20 grid place-items-center text-white"
                    >
                        <UserRound size={16} />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-1.5 min-w-[80px] rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition"
                    >
                        Вийти
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;
