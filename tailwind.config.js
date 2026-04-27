/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        mist: "#eef4ff",
        cyan: "#0ea5e9",
        gold: "#f59e0b",
        mint: "#10b981",
        coral: "#f97316",
      },
      boxShadow: {
        panel: "0 18px 45px rgba(7, 17, 31, 0.08)",
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(14,165,233,0.18), transparent 36%), radial-gradient(circle at top right, rgba(245,158,11,0.16), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
