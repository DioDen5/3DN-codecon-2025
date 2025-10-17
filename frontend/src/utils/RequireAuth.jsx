import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'


export default function RequireAuth({ children }) {
    const { isAuth } = useAuth()
    const location = useLocation()

    useEffect(() => {
        if (!isAuth) {
            window.dispatchEvent(new CustomEvent('open-login'))
        }
    }, [isAuth])

    if (!isAuth) {
        return <Navigate to="/" state={{ from: location }} replace />
    }
    return children
}
