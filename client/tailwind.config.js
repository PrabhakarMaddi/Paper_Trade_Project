/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                bg: {
                    dark: "#0a0e14",
                    card: "#151d27",
                    sidebar: "#0f1722",
                },
                accent: {
                    DEFAULT: "#10b981", // Indian Market Green
                    down: "#f43f5e",   // Indian Market Red
                    saffron: "#FF9933", // Indian Saffron
                },
                primary: "#3b82f6",
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
