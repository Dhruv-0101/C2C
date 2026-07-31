/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          marigold: 'hsl(var(--color-marigold) / <alpha-value>)',
          teal: 'hsl(var(--color-teal) / <alpha-value>)',
          indigo: 'hsl(var(--color-indigo) / <alpha-value>)',
          bg: {
            primary: 'hsl(var(--bg-primary) / <alpha-value>)',
            secondary: 'hsl(var(--bg-secondary) / <alpha-value>)',
            card: 'hsl(var(--bg-card) / <alpha-value>)',
          },
          border: 'hsl(var(--border-color) / <alpha-value>)',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 20px rgba(245, 158, 11, 0.35)',
        'glow-teal': '0 0 20px rgba(20, 184, 166, 0.35)',
      },
    },
  },
  plugins: [],
};
