/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap', '@gsap/react'],
          three: ['three', '@react-three/fiber'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    // App.test.tsx (Task 16) is the first test to mount the full tree —
    // real ScrollTrigger.create() per chapter section, a real Lenis
    // instance, and useSplitText's per-character DOM walk all run
    // synchronously on render. Under parallel worker contention the
    // default 5000ms timeout is occasionally too tight even though the
    // test itself does no async waiting; this headroom is for CI/sandbox
    // scheduling variance, not a hint that the component is slow in a
    // browser.
    testTimeout: 15000,
  },
});
