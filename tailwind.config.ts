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
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        // The Living Lab — Stitch Design System
        lab: {
          primary:      '#003223',   // Deep Forest
          'primary-c':  '#b2f0d5',   // Mint container
          'primary-inv':'#96d3b9',   // Inverse primary
          secondary:    '#516600',   // Chlorophyll
          'secondary-c':'#c8ee4f',   // Lime container
          tertiary:     '#571000',   // Saffron Heat
          'tertiary-c': '#7e1b00',   // Burnt orange
          bg:           '#fff8f1',   // Warm parchment
          surface:      '#fff8f1',
          'surface-low':  '#fff2da',
          'surface-mid':  '#f9edd4',
          'surface-high': '#f4e7ce',
          'surface-dim':  '#e5d9c1',
          'on-surface': '#211b0c',   // Dark warm brown text
          'on-variant': '#58413c',   // Muted text
          outline:      '#707974',
          'outline-var':'#bfc9c2',
          error:        '#ba1a1a',
          // inverse (for overlays/tooltips)
          'inverse-bg': '#36301f',
          'inverse-fg': '#fff8f1',
        },
      },
      boxShadow: {
        'tonal-sm': '0 1px 3px rgba(0,50,35,0.08)',
        'tonal':    '0 2px 8px rgba(0,50,35,0.10)',
        'tonal-lg': '0 4px 20px rgba(0,50,35,0.12)',
        'glass':    '0 4px 24px rgba(0,50,35,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        'primary-glow': '0 0 24px rgba(0,50,35,0.2)',
        'lime-glow': '0 0 20px rgba(200,238,79,0.35)',
      },
      borderRadius: {
        sm:  '0.25rem',
        DEFAULT: '0.375rem',
        md:  '0.5rem',
        lg:  '0.75rem',
        xl:  '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-sm': ['2.75rem', { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'display':    ['3.5rem',  { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['4.5rem',  { lineHeight: '1.0',  letterSpacing: '-0.025em',fontWeight: '700' }],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
      animation: {
        'fade-in':    'fade-in 0.25s ease-out',
        'slide-up':   'slide-up 0.4s ease-out',
        'cursor-blink':'cursor-blink 1s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'float':      'float 4s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
      },
      backgroundImage: {
        'hero-radial':    'radial-gradient(ellipse 80% 55% at 55% 0%, rgba(200,238,79,0.15) 0%, transparent 65%)',
        'text-gradient':  'linear-gradient(135deg, #003223 0%, #516600 100%)',
        'surface-shine':  'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)',
        'card-tonal':     'linear-gradient(180deg, #fff8f1 0%, #fff2da 100%)',
        'shimmer-light':  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}

export default config
