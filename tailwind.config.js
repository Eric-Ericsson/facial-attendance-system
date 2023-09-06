/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
		extend: {
			colors: {
				light: '#F5F7F9',
				dark: '#020100',
        secondary: '#0593A2',
        secondary_dark: '#080b11',
        primary: {
          100: '#1f66e0',
					200: '#1c5bca',
					300: '#1851b4',
					400: '#15479d',
					500: '#123d87',
					600: '#103778',
					700: '#0f3370',
					800: '#0c295a',
					900: '#091e43',
        },
			},
		},

		screens: {
			sm: '640px',
			// => @media (min-width: 640px) { ... }

			md: '768px',
			// => @media (min-width: 768px) { ... }

			lg: '1024px',
			// => @media (min-width: 1024px) { ... }

			xl: '1280px',
			// => @media (min-width: 1280px) { ... }

			'2xl': '1536px',
			// => @media (min-width: 1536px) { ... }
		},
	},

  plugins: [
	// require('@tailwindcss/line-clamp'),
  ],
}
