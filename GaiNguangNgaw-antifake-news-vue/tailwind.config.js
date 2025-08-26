/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: { extend: {
              fontFamily: {
                mystery: ['"Mystery Quest"', 'cursive'], 
              },
            } 
          },
  plugins: [], // ← ไม่มี require('@tailwindcss/line-clamp')
}
