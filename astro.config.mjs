import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
export default defineConfig({ site: 'https://gpabound.com', integrations: [react(), tailwind(), sitemap()], server: { allowedHosts: true }, vite: { server: { allowedHosts: true } } });
