// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://financial-records.example.com',
  trailingSlash: 'never',
  output: 'server',
  integrations: [tailwind()],
  adapter: vercel(),
});
