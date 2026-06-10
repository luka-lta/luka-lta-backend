import defaultTheme from 'tailwindcss/defaultTheme'
import {fonts} from './src/config/fonts'

const {fontFamily = {sans: ['sans-serif']}} = defaultTheme || {}

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    safelist: fonts.map((font) => `font-${font}`),
    theme: {
        container: {
            center: 'true',
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        fontFamily: {
            inter: ['Inter', ...fontFamily.sans],
            manrope: ['Manrope', ...fontFamily.sans],
            sora: ['Sora', ...fontFamily.sans],
            'dm-mono': ['DM Mono', ...fontFamily.mono],
        },
        extend: {
            keyframes: {
                "caret-blink": {
                    "0%,70%,100%": {opacity: "1"},
                    "20%,50%": {opacity: "0"},
                },
                "fade-in": {
                    "0%": {opacity: "0", transform: "translateY(8px)"},
                    "100%": {opacity: "1", transform: "translateY(0)"},
                },
                "fade-up": {
                    "0%": {opacity: "0", transform: "translateY(16px)"},
                    "100%": {opacity: "1", transform: "translateY(0)"},
                },
            },
            animation: {
                "caret-blink": "caret-blink 1.25s ease-out infinite",
                "fade-in": "fade-in 0.3s ease-out forwards",
                "fade-up": "fade-up 0.4s ease-out forwards",
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
                }
            }
        }
    },
    plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}

