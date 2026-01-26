import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import clerk from '@clerk/astro';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://nexs.or.jp',
  output: 'static',
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
  ],
  vite: {
    optimizeDeps: {
      exclude: ['@clerk/astro'],
    },
  },
});
