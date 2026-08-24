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
          primary: '#6366F1',
          secondary: '#4F46E5',
          bg: {
            primary: 'var(--bg-primary)',
            secondary: 'var(--bg-secondary)',
            card: 'var(--bg-card)',
          },
          border: 'var(--border-color)',
        },
        social: {
          instagram: '#E1306C',
          facebook: '#1877F2',
          linkedin: '#0A66C2',
          twitter: '#1DA1F2',
          whatsapp: '#25D366',
          pinterest: '#E60023',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
        panel: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
