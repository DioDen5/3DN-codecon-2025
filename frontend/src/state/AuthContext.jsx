import { createContext, useContext, useEffect, useState } from 'react'
import { tokenStore } from '../api/tokenStore'

const KEY_USER = 'studlink_user'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
    const [token, setToken] = useState(tokenStore.get())
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem(KEY_USER) || 'null') } catch { return null }
    })

    useEffect(() => {
        if (token) tokenStore.set(token)
        else tokenStore.clear()
    }, [token])

    const loginSuccess = ({ token, user }) => {
        if (token) setToken(token)
        if (user) {
            setUser(user)
            localStorage.setItem(KEY_USER, JSON.stringify(user))
        }
    }

    const logoutLocal = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem(KEY_USER)
        tokenStore.clear()
    }

    return (
        <AuthCtx.Provider value={{ token, user, isAuth: !!token, loginSuccess, logoutLocal }}>
            {children}
        </AuthCtx.Provider>
    )
}

export const useAuth = () => useContext(AuthCtx)
