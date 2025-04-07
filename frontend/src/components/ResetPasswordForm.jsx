import { useState } from "react"
import { FiUser } from "react-icons/fi"

const ResetPasswordForm = ({ switchToLogin }) => {
    const [email, setEmail] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Надіслано запит на email:", email)
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
                    className="w-full bg-blue-700 p-2 rounded-lg mt-2 text-white hover:bg-blue-800 transition"
                >
                    Надіслати
                </button>

                <button
                    type="button"
                    onClick={switchToLogin}
                    className="text-sm text-indigo-300 hover:underline"
                >
                    Повернутись до входу
                </button>
            </form>
        </div>
    )
}

export default ResetPasswordForm
