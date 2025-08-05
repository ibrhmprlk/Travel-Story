const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: "#05B6D3",
        secondary: "#EF863E",
        // varsayılan renkleri de ekle
        slate: colors.slate,
        gray: colors.gray,
        // diğer istediğin renkleri ekleyebilirsin
      },

      backgroundImage: {
        "login-bg-img": "url('/src/assets/images/bg-image.webp')",
        "signup-bg-img": "url('/src/assets/images/signup-bg-img.png')",
      },
    },
  },

  plugins: [],
};
