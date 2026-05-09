/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        fun: ['Nunito', 'sans-serif'],
      },
      animation: {
        'pop': 'pop 0.3s ease-out',
        'star': 'star 0.5s ease-out forwards',
        'wiggle': 'wiggle 0.5s ease-in-out',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        star: {
          '0%': { transform: 'scale(0) rotate(-20deg)', opacity: '0' },
          '60%': { transform: 'scale(1.4) rotate(5deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
      },
    },
  },
  plugins: [],
}
