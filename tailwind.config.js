module.exports = {
  mode: 'jit',
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1900px'
    },
    extend: {
      height: {
        large: "48rem",
        huge: "60rem"
      },
      spacing: {
        '102': '28rem',
        '108': '32rem',
        '112': '36rem',
        '120': '40rem',
        '132': '50rem'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'), // https://blog.tailwindcss.com/multi-line-truncation-with-tailwindcss-line-clamp
  ],
}
