module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        // very small devices
        xs: '320px',
        // existing breakpoints (sm, md, lg, xl, 2xl) remain available
        // add a very large breakpoint for extra-large desktop screens
        '3xl': '1600px',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '0.75rem',
          lg: '2rem',
          xl: '3rem',
          '3xl': '4rem',
        },
      },
    },
  },
  plugins: [],
};
