import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
        <header className="w-full bg-black px-10 py-5 flex items-center justify-between">
            <div className="flex items-center gap-10">
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="StudLink Logo" className="h-10 w-auto object-contain" />
                </Link>

                <nav className="flex items-center gap-7 text-[1.1rem] mx-10">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `transition-colors duration-300 ${isActive ? 'text-pink-400' : 'text-white hover:text-pink-400'}`
                        }
                        end
                    >
                        Головна
                    </NavLink>
                    <NavLink
                        to="/teachers"
                        className={({ isActive }) =>
                            `transition-colors duration-300 ${isActive ? 'text-pink-400' : 'text-white hover:text-pink-400'}`
                        }
                    >
                        Викладачі
                    </NavLink>
                    <NavLink
                        to="/forum"
                        className={({ isActive }) =>
                            `transition-colors duration-300 ${isActive ? 'text-pink-400' : 'text-white hover:text-pink-400'}`
                        }
                    >
                        Форум
                    </NavLink>
                </nav>
            </div>

            {!isAuthed ? (
                <div className="flex items-center gap-3">
                    <button
                        onClick={onLoginOpen}
                        className="px-5 py-2 min-w-[96px] rounded-md bg-blue-200 text-blue-600 font-medium hover:bg-gray-100 transition cursor-pointer"
                    >
                        Увійти
                    </button>
                    <button
                        onClick={onSignupOpen}
                        className="px-5 py-2 min-w-[96px] rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
                    >
                        Реєстрація
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <Link
                        to="/profile"
                        title={user?.displayName || "Користувач"}
                        className="h-10 w-10 rounded-full bg-white/10 border border-white/20 grid place-items-center text-white hover:bg-white/20 transition"
                    >
                        <UserRound size={20} />
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="px-5 py-2 min-w-[96px] rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition cursor-pointer"
                    >
                        Вийти
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;
