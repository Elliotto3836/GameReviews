/** @type {import('tailwindcss').Config} */

import tailwindNord from "tailwind-nord"

export default {
  content: [
    './src/**/*.{html,js,mjs,jsx,ts,hbs}',
    './src/public/**/*.{html,js,mjs,jsx,ts,hbs}', 
    './views/**/*.{html,js,jsx,ts,hbs}',  
  ],
  theme: {
    colors:{

    },
    extend: {},
  },
  plugins: [tailwindNord],
}


