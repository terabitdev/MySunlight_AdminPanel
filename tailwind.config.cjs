/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-page-gradient': 'linear-gradient(180deg, #D3E4E8 0%, #E3E9E8 30.29%, #FBF3EB 69.71%, #FCE3D2 96.63%)',
      },
      colors: {
        'bg-primary': '#E3E9E8',
        'primaryDark': '#150A02',
      },
      fontFamily: {
        'david-libre': ['David Libre', 'serif'],
        'inter-tight': ['Inter Tight', 'sans-serif'],
        'manrope': ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
};