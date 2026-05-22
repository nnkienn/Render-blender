/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: "#09090B",
        "nnkienn-pink": "#FF2A85",
        "nnkienn-blue": "#00C3FF",
        "nnkienn-green": "#10B981"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      fontSize: {
        micro: ["0.64rem", { letterSpacing: "0.3em" }]
      }
    }
  },
  plugins: []
};
