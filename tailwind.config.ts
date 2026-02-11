import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a12',
          secondary: '#0d0d1a',
          card: 'rgba(15, 15, 30, 0.8)',
        },
        neon: {
          cyan: '#00f5ff',
          pink: '#ff2d6a',
          orange: '#ff8c00',
          green: '#00ff88',
          purple: '#a855f7',
          yellow: '#ffd700',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.1)',
        },
      },
      fontFamily: {
        display: ['var(--font-orbitron)', 'Rajdhani', 'sans-serif'],
        body: ['var(--font-inter)', 'Roboto', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(0, 245, 255, 0.3)',
        'glow-pink': '0 0 20px rgba(255, 45, 106, 0.5), 0 0 40px rgba(255, 45, 106, 0.3)',
        'glow-orange': '0 0 20px rgba(255, 140, 0, 0.5), 0 0 40px rgba(255, 140, 0, 0.3)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.3)',
        'glow-sm-cyan': '0 0 10px rgba(0, 245, 255, 0.4)',
        'glow-sm-pink': '0 0 10px rgba(255, 45, 106, 0.4)',
        'glow-sm-orange': '0 0 10px rgba(255, 140, 0, 0.4)',
        'glow-sm-green': '0 0 10px rgba(0, 255, 136, 0.4)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'rotate-slow': 'rotate 20s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        // Gacha animations
        'shake': 'shake 0.15s ease-in-out infinite',
        'shake-intense': 'shake-intense 0.1s ease-in-out infinite',
        'burst': 'burst 0.6s ease-out forwards',
        'reveal-glow': 'reveal-glow 0.5s ease-out infinite',
        'confetti-fall': 'confetti-fall 3s linear forwards',
        'sparkle': 'sparkle 0.8s ease-out infinite',
        'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        rotate: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Gacha keyframes
        shake: {
          '0%, 100%': { transform: 'translateX(0) rotate(0)' },
          '25%': { transform: 'translateX(-5px) rotate(-2deg)' },
          '75%': { transform: 'translateX(5px) rotate(2deg)' },
        },
        'shake-intense': {
          '0%, 100%': { transform: 'translateX(0) translateY(0) rotate(0)' },
          '20%': { transform: 'translateX(-8px) translateY(-3px) rotate(-3deg)' },
          '40%': { transform: 'translateX(8px) translateY(3px) rotate(3deg)' },
          '60%': { transform: 'translateX(-8px) translateY(-3px) rotate(-3deg)' },
          '80%': { transform: 'translateX(8px) translateY(3px) rotate(3deg)' },
        },
        burst: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
        'reveal-glow': {
          '0%, 100%': { boxShadow: '0 0 20px currentColor' },
          '50%': { boxShadow: '0 0 40px currentColor, 0 0 60px currentColor' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
        sparkle: {
          '0%, 100%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'holographic': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,245,255,0.1) 25%, rgba(255,45,106,0.1) 50%, rgba(0,255,136,0.1) 75%, rgba(255,255,255,0.1) 100%)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}

export default config
