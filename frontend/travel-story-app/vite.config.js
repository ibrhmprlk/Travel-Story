import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // İstediğin portu yazabilirsin
    open: true, // Tarayıcı otomatik açılsın istersen
    host: true, // Tüm ağ arayüzlerinden erişime açar
    allowedHosts: "all", // Herhangi bir hosttan erişime izin verir
  },
});
