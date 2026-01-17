import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import clerk from '@clerk/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://nexs.or.jp',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
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
