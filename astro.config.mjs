// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import clerk from '@clerk/astro';
import { koKR } from '@clerk/localizations';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  integrations: [
    preact({ compat: true }),
    clerk({
      localization: koKR,
    })
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        'fs': 'node:fs',
        'path': 'node:path',
        'react-dom/server': 'react-dom/server.edge',
      }
    }
  }
});