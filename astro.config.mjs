import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import clerk from '@clerk/astro';
import mdx from '@astrojs/mdx';
import keystatic from '@keystatic/astro';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://nexs.or.jp',
  output: 'hybrid',
  adapter: node({
    mode: 'standalone',
  }),
  trailingSlash: 'ignore',
  integrations: [
    mdx(),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    clerk({
      afterSignInUrl: '/',
      afterSignUpUrl: '/',
    }),
    keystatic(),
  ],
  vite: {
    optimizeDeps: {
      exclude: ['@clerk/astro'],
    },
  },
});
