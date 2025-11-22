import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["./assets/css/main.css"],
  postcss: {
    plugins: {},
  },
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ["@nuxt/icon", "@pinia/nuxt", "pinia-plugin-persistedstate/nuxt"],
});
