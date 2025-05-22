// This file will help Netlify deploy your React application correctly

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the _redirects file directly instead of copying it
try {
  // Ensure the directory exists
  if (!fs.existsSync(path.join(__dirname, 'dist', 'public'))) {
    fs.mkdirSync(path.join(__dirname, 'dist', 'public'), { recursive: true });
  }
  
  // Create the _redirects file
  fs.writeFileSync(
    path.join(__dirname, 'dist', 'public', '_redirects'),
    '/* /index.html 200'
  );
  console.log('✅ _redirects file created successfully');
} catch (error) {
  console.error('❌ Error creating _redirects file:', error);
}

// Simple server approach with Netlify
console.log('✅ Netlify deployment files prepared successfully');