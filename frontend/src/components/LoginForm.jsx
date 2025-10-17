import { useState } from "react"
import { login } from "../api/auth"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../state/AuthContext"

const LoginForm = ({ switchToReset, onSuccess }) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const auth = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const data = await login(email, password)
            auth.loginSuccess(data)
            onSuccess?.()
            navigate('/forum')
        } catch {
            setError("Невірна пошта або пароль")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-10 w-full text-white">
            {/* ... твій UI без змін ... */}
            <div>
                <label className="block text-sm text-white-700">Email</label>
                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
                       className="w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 placeholder-white/50 focus:outline-none text-gray-800"
                       placeholder="example@lnu.edu.ua" autoComplete="email" required />
            </div>
            <div>
                <label className="block text-sm text-white-700">Password</label>
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)}
                       className="w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 placeholder-white/50 focus:outline-none text-gray-800"
                       placeholder="Your Password" autoComplete="current-password" required />
            </div>
            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                    <input type="checkbox" className="form-checkbox h-4 w-4 rounded-sm bg-transparent border-white checked:bg-white" />
                    <span className="text-md">Запам'ятати мене</span>
                </label>
                <button type="button" onClick={switchToReset} className="font-medium text-md text-indigo-300 hover:underline">
                    Забули пароль?
                </button>
            </div>
            {error && <p className="text-red-400">{error}</p>}
            <button type="submit" disabled={loading}
                    className="w-full bg-blue-700 p-2 rounded-lg mt-8 text-white hover:bg-blue-800 transition disabled:opacity-60">
                {loading ? "Вхід..." : "Авторизуватися"}
            </button>
        </form>
    )
}

export default LoginForm
