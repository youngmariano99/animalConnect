/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        health: '#006D77', // Bio-Teal (Salud)
        love: '#E27364',   // Living Coral (Amor)
        hope: '#FFB703',   // Sunrise Gold (Esperanza)
        nature: '#83C5BE', // Soft Sage (Medioambiente)
        tech: '#264653',   // Midnight Navy (Texto/Autoridad)
        canvas: '#F8F9FA'  // Cloud White (Fondo)
      },
      fontFamily: {
        heading: ['Nunito', 'sans-serif'], // Emocional/Redondeada
        body: ['Inter', 'sans-serif']      // Funcional/Legible
      },
      borderRadius: {
        'pet': '1.5rem' // Bordes extra suaves para tarjetas
      }
    },
  },
  plugins: [],
}