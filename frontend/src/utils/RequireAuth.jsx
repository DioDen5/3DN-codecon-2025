import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../state/AuthContext";

export default function RequireAuth({ children }) {
    const { isAuth, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !isAuth) {
            window.dispatchEvent(new CustomEvent("open-login"));
        }
    }, [isAuth, loading]);

    if (loading) {
        return <div className="text-center text-white/70 py-10">Завантаження…</div>;
    }

    if (!isAuth) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
}
