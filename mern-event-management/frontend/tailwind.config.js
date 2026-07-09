/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        plum: {
          50: '#f5f0f7',
          100: '#e9dcee',
          200: '#d0b3dd',
          300: '#b285c8',
          400: '#8f55a8',
          500: '#6d3a86',
          600: '#54296a',
          700: '#3B1E54',
          800: '#2c1640',
          900: '#1e0f2c',
        },
        marigold: {
          50: '#fff8e8',
          100: '#ffedc2',
          200: '#ffdc8a',
          300: '#ffc652',
          400: '#f9b02a',
          500: '#F4A300',
          600: '#c98300',
          700: '#996300',
          800: '#6b4600',
          900: '#432c00',
        },
        cream: '#FAF7F0',
        ink: '#22201D',
        sage: '#7FA99B',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        perforate:
          'radial-gradient(circle, transparent 6px, #FAF7F0 6.5px), radial-gradient(circle, transparent 6px, #FAF7F0 6.5px)',
      },
    },
  },
  plugins: [],
};
