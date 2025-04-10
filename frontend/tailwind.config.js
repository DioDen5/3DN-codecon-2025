/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                blink: 'blink 1s step-start infinite',
            },
            keyframes: {
                blink: {
                    '50%': { opacity: '0' },
                },
            },
        },
    },
    plugins: [],
}
