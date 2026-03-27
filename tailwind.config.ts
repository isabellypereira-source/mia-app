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
          orange: '#FA5528',       // Principal
          'orange-hover': '#e04420',
          respiro: '#054A37',      // Fundo escuro principal
          ancestral: '#196454',    // Fundo secundário
          'selva-real': '#006E51', // Verde médio
          viva: '#ABD032',         // Verde-limão / destaque
          'viva-dark': '#8fa328',
          alma: '#F1D7A6',         // Bege / respiro
          areia: '#DB853D',        // Laranja-terroso
          solo: '#662F00',         // Marrom escuro
          // Aliases semânticos usados nos componentes
          dark: '#054A37',         // bg principal → Respiro
          'dark-2': '#196454',     // bg cards/sidebar → Ancestral
          'dark-3': '#006E51',     // bg hover → Selva Real
          green: '#FA5528',        // CTA primário → Orange (identidade Morphê)
          'green-light': '#e04420',// CTA hover
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'cursor-blink': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'cursor-blink': 'cursor-blink 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
