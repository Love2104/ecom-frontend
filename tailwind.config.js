/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "primary": {
          DEFAULT: "#0a0a0f",
          foreground: "#ffffff",
          900: "#0a0a0f",
        },
        "accent-gold": "#d4af37",
        "accent-red": "#e63946",
        "indian-red": "#e63946",
        "background-light": "#fdfaf5",
        "background-dark": "#0a0a0f",
        "cream": "#fdfaf5",
        "cream-bg": "#fdfaf5",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "#0a0a0f",
        background: "#fdfaf5",
        foreground: "#0a0a0f",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "#e63946",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#d4af37",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        "display": ['"Plus Jakarta Sans"', 'sans-serif'],
        "sans": ['Inter', 'sans-serif'],
        "body": ['Manrope', 'sans-serif']
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "marquee": "marquee 30s linear infinite"
      },
      backgroundImage: {
        'hero-grid-texture': 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
      },
      backgroundSize: {
        'hero-grid-texture': '24px 24px',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}