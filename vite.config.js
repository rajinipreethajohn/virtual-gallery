// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',  // Allow access from other devices on the network
    port: 5174         // Your current port
  }
});
