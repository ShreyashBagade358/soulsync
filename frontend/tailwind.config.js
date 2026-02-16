/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Theme Base
        dark: {
          900: '#0a0a0a',    // Pure black
          800: '#121212',    // Soft black
          700: '#1a1a1a',    // Dark gray
          600: '#242424',    // Medium dark
          500: '#2d2d2d',    // Card background
          400: '#3a3a3a',    // Border
          300: '#4a4a4a',    // Light border
          200: '#666666',    // Muted text
          100: '#999999',    // Secondary text
        },
        // Red Theme Accents
        red: {
          950: '#2a0a0a',    // Dark red bg
          900: '#450a0a',    // Deep red
          800: '#7f1d1d',    // Dark red
          700: '#991b1b',    // Primary red
          600: '#b91c1c',    // Bright red
          500: '#dc2626',    // Main accent
          400: '#ef4444',    // Light red
          300: '#f87171',    // Soft red
          200: '#fca5a5',    // Pale red
          100: '#fee2e2',    // Lightest red
          50: '#fef2f2',     // Near white red
        },
        // Additional accents
        accent: {
          gold: '#d4af37',
          silver: '#c0c0c0',
          rose: '#e11d48',
          crimson: '#dc143c',
        }
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #121212 100%)',
        'gradient-red': 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)',
        'gradient-card': 'linear-gradient(145deg, #1a1a1a 0%, #242424 100%)',
        'gradient-button': 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        'gradient-radial-red': 'radial-gradient(circle at center, #7f1d1d 0%, #0a0a0a 70%)',
      },
      boxShadow: {
        'red-glow': '0 0 20px rgba(220, 38, 38, 0.3)',
        'red-glow-lg': '0 0 40px rgba(220, 38, 38, 0.4)',
        'dark-card': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        'dark-card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'swipe-right': 'swipeRight 0.5s ease-out forwards',
        'swipe-left': 'swipeLeft 0.5s ease-out forwards',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-red': 'pulseRed 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        swipeRight: {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateX(200%) rotate(30deg)', opacity: '0' },
        },
        swipeLeft: {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateX(-200%) rotate(-30deg)', opacity: '0' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseRed: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.7', boxShadow: '0 0 30px rgba(220, 38, 38, 0.5)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(220, 38, 38, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(220, 38, 38, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
