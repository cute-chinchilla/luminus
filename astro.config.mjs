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
    platformProxy: {
      enabled: true,
    },
    session: {
      enabled: false,
    }
  }),
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