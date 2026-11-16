import {fonts} from './src/config/fonts'

const hsl = (name) => `hsl(var(--${name}))`

/**
 * Tailwind-Theme. Alle Werte verweisen auf CSS-Variablen aus src/index.css.
 * Neue Farben/Abstände zuerst als Token anlegen, nicht direkt in Komponenten.
 * Doku: docs/design-system.md
 */
/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    safelist: fonts.map((font) => `font-${font}`),
    theme: {
        container: {
            center: true,
            padding: '1rem',
            screens: {'2xl': '1400px'},
        },
        extend: {
            fontFamily: {
                sans: ['var(--font-sans)'],
                mono: ['var(--font-mono)'],
                inter: ['Inter', 'sans-serif'],
                manrope: ['Manrope', 'sans-serif'],
                sora: ['Sora', 'sans-serif'],
                system: ['ui-sans-serif', 'system-ui', 'sans-serif'],
                brand: ['Sora', 'var(--font-sans)'],
            },
            maxWidth: {
                // Content-Breiten
                page: '1440px',
                'page-narrow': '960px',
                form: '42rem',
            },
            zIndex: {
                header: '30',
                sidebar: '40',
                overlay: '50',
                popover: '60',
                toast: '100',
            },
            boxShadow: {
                xs: 'var(--shadow-xs)',
                sm: 'var(--shadow-sm)',
                DEFAULT: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
                xl: 'var(--shadow-lg)',
            },
            transitionDuration: {
                fast: 'var(--duration-fast)',
                DEFAULT: 'var(--duration-base)',
                base: 'var(--duration-base)',
                slow: 'var(--duration-slow)',
            },
            transitionTimingFunction: {
                DEFAULT: 'var(--ease-standard)',
                standard: 'var(--ease-standard)',
            },
            keyframes: {
                "caret-blink": {
                    "0%,70%,100%": {opacity: "1"},
                    "20%,50%": {opacity: "0"},
                },
                "fade-in": {
                    "0%": {opacity: "0", transform: "translateY(4px)"},
                    "100%": {opacity: "1", transform: "translateY(0)"},
                },
            },
            animation: {
                "caret-blink": "caret-blink 1.25s ease-out infinite",
                "fade-in": "fade-in var(--duration-slow) var(--ease-standard) both",
            },
            borderRadius: {
                xl: 'calc(var(--radius) + 4px)',
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            colors: {
                brand: {
                    DEFAULT: hsl('brand'),
                    teal: hsl('brand-teal'),
                },
                background: hsl('background'),
                foreground: hsl('foreground'),
                card: {DEFAULT: hsl('card'), foreground: hsl('card-foreground')},
                popover: {DEFAULT: hsl('popover'), foreground: hsl('popover-foreground')},
                primary: {DEFAULT: hsl('primary'), foreground: hsl('primary-foreground')},
                secondary: {DEFAULT: hsl('secondary'), foreground: hsl('secondary-foreground')},
                muted: {DEFAULT: hsl('muted'), foreground: hsl('muted-foreground')},
                accent: {DEFAULT: hsl('accent'), foreground: hsl('accent-foreground')},
                destructive: {DEFAULT: hsl('destructive'), foreground: hsl('destructive-foreground')},
                success: {DEFAULT: hsl('success'), foreground: hsl('success-foreground')},
                warning: {DEFAULT: hsl('warning'), foreground: hsl('warning-foreground')},
                info: {DEFAULT: hsl('info'), foreground: hsl('info-foreground')},
                border: hsl('border'),
                input: hsl('input'),
                ring: hsl('ring'),
                chart: {
                    '1': hsl('chart-1'),
                    '2': hsl('chart-2'),
                    '3': hsl('chart-3'),
                    '4': hsl('chart-4'),
                    '5': hsl('chart-5'),
                },
                sidebar: {
                    DEFAULT: hsl('sidebar-background'),
                    foreground: hsl('sidebar-foreground'),
                    primary: hsl('sidebar-primary'),
                    'primary-foreground': hsl('sidebar-primary-foreground'),
                    accent: hsl('sidebar-accent'),
                    'accent-foreground': hsl('sidebar-accent-foreground'),
                    border: hsl('sidebar-border'),
                    ring: hsl('sidebar-ring'),
                },
            },
        },
    },
    plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
