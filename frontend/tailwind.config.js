export default {
   content: ["./src/**/*.{html,js,jsx,ts,tsx}"], // Sửa lại một chút cho đúng
   theme: { extend: {} },
   plugins: [ require('daisyui') ],
   daisyui: {
    themes: ["light", "night"], 
    darkTheme: "night",
  },
 }