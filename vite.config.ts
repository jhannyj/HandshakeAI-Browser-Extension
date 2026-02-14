import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json'; // Import your manifest directly

export default defineConfig({
    plugins: [
        crx({ manifest }), // This plugin handles the TS -> JS conversion in the manifest
    ],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
});