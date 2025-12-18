import { useState } from "react"
import { FiUser } from "react-icons/fi"
import { forgotPassword } from "../api/auth"

const ResetPasswordForm = ({ switchToLogin }) => {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setMessage("")

        try {
            const result = await forgotPassword(email)
            setMessage(result.message)
        } catch (error) {
            console.error('Forgot password error:', error)
            setError(error.response?.data?.error || 'Помилка при відправці запиту')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md text-white p-6 flex flex-col items-center space-y-5 text-center"
            >
                <h2 className="text-3xl font-semibold">Відновлення пароля</h2>

                <p className="text-white/80 text-md">
                    Вкажіть свою електронну пошту і ми надішлемо інструкцію з відновлення пароля
                </p>

                {message && (
                    <div className="w-full p-3 bg-green-500/20 border border-green-400/40 rounded-lg text-green-300 text-sm">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="w-full p-3 bg-red-500/20 border border-red-400/40 rounded-lg text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <div className="relative w-full">
                    <input
                        type="email"
                        placeholder="example@lnu.edu.ua"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 pl-12 bg-white/20 text-white placeholder-white/60 rounded-xl outline-none"
                    />
                    <FiUser className="absolute top-1/2 left-4 -translate-y-1/2 text-white/60 text-xl" />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full p-2 rounded-lg mt-2 text-white transition ${
                        loading
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-blue-700 hover:bg-blue-800 cursor-pointer'
                    }`}
                >
                    {loading ? 'Відправляємо...' : 'Надіслати'}
                </button>

                <button
                    type="button"
                    onClick={switchToLogin}
                    className="text-sm text-indigo-300 hover:underline cursor-pointer"
                >
                    Повернутись до входу
                </button>
            </form>
        </div>
    )
}

export default ResetPasswordForm
