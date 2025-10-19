import { useState } from "react";
import { register } from "../api/auth"; // Імпорт функції реєстрації

const SignupForm = ({ switchToLogin }) => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirm: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Валідація паролів
            if (formData.password !== formData.passwordConfirm) {
                throw new Error('Паролі не співпадають');
            }
            
            await register({
                email: formData.email,
                password: formData.password,
                displayName: `${formData.firstName} ${formData.lastName}`,
                firstName: formData.firstName,
                lastName: formData.lastName
            });
            switchToLogin(); // ← Перекидання на форму логіну
        } catch (error) {
            console.error('Registration error:', error);
            // можеш додати логіку відображення помилки
        }
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-15 w-full text-white">
            <h2 className="text-2xl font-semibold mb-4">Profile</h2>
            <div>
                <label className="block text-md">First Name</label>
                <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 placeholder-white/50 focus:outline-none input text-gray-800"
                    placeholder="Anna"
                />
            </div>
            <div>
                <label className="block text-md">Last Name</label>
                <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 placeholder-white/50 focus:outline-none input text-gray-800"
                    placeholder="Last Name"
                />
            </div>
            <div>
                <label className="block text-md">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-[#D9D9D9]/20 placeholder-white/50 focus:outline-none input text-gray-800"
                    placeholder="Email"
                />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Password</h2>
            <div>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-white/60 outline-none input text-gray-800"
                    placeholder="Your Password"
                />
            </div>
            <div>
                <input
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-white/60 outline-none mb-8 input text-gray-800"
                    placeholder="Confirm Password"
                />
            </div>
            <button type="submit" className="w-full bg-blue-700 p-2 outline-none rounded-lg cursor-pointer">
                Confirm
            </button>
        </form>
    );
};

export default SignupForm;
