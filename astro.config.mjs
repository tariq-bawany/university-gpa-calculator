import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gpabound.com',
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/ui-preview/') })],
  server: { allowedHosts: true },
  vite: { server: { allowedHosts: true } }
});
