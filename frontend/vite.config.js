import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { parse } from 'yaml';

function loadSecrets() {
  const secretsPath = path.resolve(__dirname, '../config/secrets.yaml');
  if (!fs.existsSync(secretsPath)) return {};
  return parse(fs.readFileSync(secretsPath, 'utf-8'));
}

export default defineConfig(() => {
  const secrets = loadSecrets();
  const firebaseApiKey = secrets?.clabs?.infinitepieces?.['firebase-api-key'] ?? '';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    define: {
      __FIREBASE_API_KEY__: JSON.stringify(firebaseApiKey),
    },
    server: {
      proxy: {
        '/api': 'http://localhost:8080',
      },
    },
  };
});
