import { Navigate } from 'react-router-dom';
import { getToken } from '../api/auth';

export default function RequireAuth({ children }) {
    const t = getToken();
    if (!t) return <Navigate to="/login" replace />;
    return children;
}
