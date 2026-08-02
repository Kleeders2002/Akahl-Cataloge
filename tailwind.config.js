/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // AKAHL Brand Typography
        display: ['Cinzel', 'Times New Roman', 'serif'], // Tipografía primaria - mayúsculas, clásico y distinguido
        sans: ['"Gill Sans MT"', 'Gill Sans', 'Arial', 'sans-serif'], // Tipografía secundaria - textos legibles
        body: ['"Gill Sans MT"', 'Gill Sans', 'Arial', 'sans-serif'],
        serif: ['Cinzel', 'Times New Roman', 'serif'], // Definir serif correctamente
      },
      colors: {
        // AKAHL Brand Colors
        akahl: {
          primary: '#223c33', // Verde Oscuro - Color primario de la marca
          'primary-light': '#2d5246',
          'primary-dark': '#1a2f28',
          secondary: '#ceb652', // Dorado / Amarillo Mostaza - Color secundario
          'secondary-light': '#e0c864',
          'secondary-dark': '#b8a347',
        },
        // Neutral palette for balance
        neutral: {
          50: '#fafafa',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0a0a0a',
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.3), 0 10px 20px -2px rgba(0, 0, 0, 0.2)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'premium': '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 2px 8px -2px rgba(206, 182, 82, 0.1)',
        'gold-glow': '0 0 20px -5px rgba(206, 182, 82, 0.4)',
        'green-glow': '0 0 20px -5px rgba(34, 60, 51, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'pulse-gold': 'pulseGold 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'reveal': 'reveal 0.8s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px -5px rgba(206, 182, 82, 0.3)' },
          '50%': { boxShadow: '0 0 40px -5px rgba(206, 182, 82, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'scale(0.9) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(135deg, #223c33 0%, #1a2f28 50%, #0a0a0a 100%)',
        'gold-gradient': 'linear-gradient(135deg, #ceb652 0%, #b8a347 100%)',
        'subtle-gold': 'linear-gradient(135deg, rgba(206, 182, 82, 0.1) 0%, rgba(206, 182, 82, 0.05) 50%, transparent 100%)',
        'luxury-pattern': 'repeating-linear-gradient(90deg, rgba(206, 182, 82, 0.03) 0px, rgba(206, 182, 82, 0.03) 1px, transparent 1px, transparent 40px)',
      },
    },
  },
  plugins: [],
}
