/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#111315",
        surface: "#191C20",
        "surface-sidebar": "#1B1E22",
        "surface-activity": "#17191C",
        "surface-elevated": "#22262B",
        "surface-hover": "#262B31",
        border: {
          DEFAULT: "#2B3036",
          soft: "#1F2327",
          active: "#38BDF8",
        },
        text: {
          primary: "#E4E7EB",
          secondary: "#969EA8",
          muted: "#6B7280",
        },
        accent: {
          DEFAULT: "#38BDF8",
          soft: "rgba(56, 189, 248, 0.12)",
          hover: "#0284C7",
        },
        status: {
          match: "#4ADE80",
          partial: "#FBBF24",
          fail: "#F87171",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          '"Fira Sans"',
          '"Droid Sans"',
          '"Helvetica Neue"',
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      boxShadow: {
        panel: "0 4px 20px rgba(0, 0, 0, 0.4)",
        dialog: "0 16px 48px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};
