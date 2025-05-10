/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6FCEFC',
          DEFAULT: '#4EBBFF',
          dark: '#3AABF0',
        },
        secondary: {
          light: '#FFB067',
          DEFAULT: '#FF9D47',
          dark: '#F08C37',
        },
        success: {
          light: '#85E0A3',
          DEFAULT: '#5DC983',
          dark: '#4AB86F',
        },
        warning: {
          light: '#FFDC72',
          DEFAULT: '#FFCF40',
          dark: '#F0C030',
        },
      },
    },
  },
  plugins: [],
  nativewind: {
    styledComponents: ["LinearGradient"],
  },
};
