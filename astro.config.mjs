// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import clerk from '@clerk/astro';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  // build: {
  //   client: './dist',
  //   server: './dist/_worker.js',
  // },
  build: {
    client: './dist', // 정적 파일 (이미지, JS 등)
    server: './dist'         // 서버 파일 (_worker.js가 여기 생김)
  },
  integrations: [
    preact({ compat: true }),
    clerk()
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        'react-dom/server': 'react-dom/server.edge',
      }
    }
  }
});