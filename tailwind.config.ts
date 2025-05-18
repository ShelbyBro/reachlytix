
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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#FF3185', // brand main pink
					foreground: '#fff'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: '#171B27', // new dark for sidebar backgrounds
					foreground: '#fff',
					primary: '#FF3185', // brand color
					'primary-foreground': '#fff',
					accent: '#F4358F',
					'accent-foreground': '#fff',
					border: '#232A3A',
					ring: '#E83899'
				},
				// Updated brand spectrum
                brand: {
                    p1: '#FF3185', // solid pink for all single-shade use
                    p2: '#F4358F',
                    p3: '#E83899',
                    p4: '#DD3CA3',
                    p5: '#D23FAE',
                    p6: '#C642B8',
                    p7: '#BB46C2'
                },
				dark: {
					DEFAULT: '#171B27'
				}
			},
			backgroundImage: {
				'gradient-primary':
					'linear-gradient(90deg, #FF3185 0%, #F4358F 16%, #E83899 32%, #DD3CA3 48%, #D23FAE 64%, #C642B8 80%, #BB46C2 100%)',
				'gradient-secondary': 'linear-gradient(90deg, #171B27 0%, #232A3A 100%)',
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
        "glow": "glow 2s ease-in-out infinite alternate",
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
        "glow": "glow 2s ease-in-out infinite alternate",
			},
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 15px #F4358F" },
          "100%": { boxShadow: "0 0 25px #E83899" }
        },
      },
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

