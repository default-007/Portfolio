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
        // Function form, not the object form. Listing bare package names
        // pulls in their whole dependency subtree, which swept React's JSX
        // runtime into the `three` chunk — the entry then statically
        // depended on it, so index.html modulepreloaded all 898 kB of
        // three for every visitor, including the phones and no-WebGL
        // devices that never mount EmberField. Matching on module paths
        // assigns only the libraries themselves and leaves React where
        // Rollup already puts it, so three stays reachable solely through
        // EmberField's dynamic import.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // React is pinned to its own chunk first. Left unassigned it gets
          // absorbed into whichever manual chunk reaches it — which was the
          // three chunk — dragging three back into the entry's static graph
          // and undoing the split.
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
          if (id.includes('/three/') || id.includes('@react-three')) return 'three';
          if (id.includes('/gsap/') || id.includes('@gsap')) return 'gsap';
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
