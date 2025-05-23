import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				cairo: ['Cairo', 'sans-serif'],
			},
			colors: {
				border: '#E0E0E0',
				input: 'hsl(var(--input))',
				ring: '#4A90E2',
				background: '#FAFAFA',
				foreground: '#2C3E50',
				primary: {
					DEFAULT: '#4A90E2',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#F4D03F',
					foreground: '#2C3E50'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: '#7F8C8D'
				},
				accent: {
					DEFAULT: '#00BCD4',
					foreground: '#2C3E50'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: '#FFFFFF',
					foreground: '#2C3E50'
				},
				sidebar: {
					DEFAULT: '#FAFAFA',
					foreground: '#2C3E50',
					primary: '#4A90E2',
					'primary-foreground': '#FFFFFF',
					accent: '#00BCD4',
					'accent-foreground': '#2C3E50',
					border: '#E0E0E0',
					ring: '#4A90E2'
				},
				algeria: {
					red: '#cc2828',
					green: '#147828',
					gold: '#e6a80c',
				},
				qr: {
					primary: '#4A90E2',
					secondary: '#F4D03F',
					accent: '#00BCD4',
					light: '#FAFAFA',
					dark: '#2C3E50',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
