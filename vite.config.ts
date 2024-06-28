import { defineConfig } from 'vite'
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    svgr(),
    basicSsl(),
  ],
  define: {
    'process.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
  }
})
