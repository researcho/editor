import { defineConfig } from 'vite'
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl"
import fs from 'fs';

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
    'process.env.APP_VERSION': '"' + fs.readFileSync('./.VERSION', 'utf8').trim() + '"',
  }
})
