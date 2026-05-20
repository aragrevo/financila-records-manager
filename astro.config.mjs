// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://financial-records.example.com',
  trailingSlash: 'never',
  output: 'static',
  integrations: [tailwind()],
});
