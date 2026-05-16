/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0B132B',
          dark: '#040811',
          deep: '#060B19',
          panel: '#0A1220',
          navy: '#12214A',
        },
        surface: {
          DEFAULT: '#F4F7FB',
          blue: '#e8f0f8',
          warm: '#fdf0e6',
        },
        accent: {
          DEFAULT: '#00E5FF',
          gold: '#FFC800',
          'gold-muted': '#D7A83F',
          pink: '#FF3366',
          mint: '#00FF9D',
        },
        // Data Flow Pro app palette
        dfp: {
          DEFAULT: '#0A192F',
          light: '#112240',
          border: '#233554',
          dark: '#061224',
        },
        // Clinic Scheduler dark navy palette
        sched: {
          bg: '#0b132b',
          panel: '#1b2838',
          header: '#162032',
          border: '#233554',
        },
        // SubPool Marketplace dark cyberpunk palette
        pool: {
          bg: '#040811',
          panel: '#0A1220',
        },
      },
    },
  },
  plugins: [],
};
