import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // Paleta oficial Morphê
        morphe: {
          orange: '#FA5528',
          'orange-hover': '#e04420',
          respiro: '#054A37',
          ancestral: '#196454',
          'selva-real': '#006E51',
          viva: '#ABD032',
          'viva-dark': '#8fa328',
          alma: '#F1D7A6',
          areia: '#DB853D',
          solo: '#662F00',
          dark: '#054A37',
          'dark-2': '#196454',
          'dark-3': '#006E51',
          green: '#FA5528',
          'green-light': '#e04420',
        },
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.35)',
        'card-hover': '0 8px 40px rgba(250,85,40,0.18), 0 2px 8px rgba(0,0,0,0.4)',
        'card-hover-viva': '0 8px 40px rgba(171,208,50,0.15), 0 2px 8px rgba(0,0,0,0.4)',
        'glow-orange': '0 0 24px rgba(250,85,40,0.35)',
        'glow-orange-lg': '0 0 48px rgba(250,85,40,0.3)',
        'glow-viva': '0 0 24px rgba(171,208,50,0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-sm': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display': ['56px', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-lg': ['64px', { lineHeight: '1.0', letterSpacing: '-0.03em', fontWeight: '700' }],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up-lg': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 16px rgba(250,85,40,0.3)' },
          '50%': { boxShadow: '0 0 32px rgba(250,85,40,0.6)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(250,85,40,0.3)' },
          '50%': { borderColor: 'rgba(250,85,40,0.7)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.35s ease-out',
        'slide-up-lg': 'slide-up-lg 0.5s ease-out',
        'cursor-blink': 'cursor-blink 1s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'border-glow': 'border-glow 2s ease-in-out infinite',
      },
      backgroundImage: {
        'hero-radial': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(250,85,40,0.12) 0%, transparent 70%)',
        'hero-radial-lg': 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(250,85,40,0.15) 0%, transparent 65%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}

export default config
