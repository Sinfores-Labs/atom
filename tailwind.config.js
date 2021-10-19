module.exports = {
  mode: 'jit',
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      height: {
        large: "48rem",
        huge: "60rem"
      },
      spacing: {
        '108': '32rem'
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
