// This file will help Netlify deploy your React application correctly

const fs = require('fs');
const path = require('path');

// Make sure the _redirects file is in the correct location
try {
  fs.copyFileSync(
    path.join(__dirname, 'public', '_redirects'),
    path.join(__dirname, 'dist', 'public', '_redirects')
  );
  console.log('✅ _redirects file copied successfully');
} catch (error) {
  console.error('❌ Error copying _redirects file:', error);
}

// Create an index.js file at the root level to serve your React app
const indexContent = `
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// For any request that doesn't match a static file, send the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

try {
  fs.writeFileSync(path.join(__dirname, 'dist', 'index.js'), indexContent);
  console.log('✅ Server index.js created successfully');
} catch (error) {
  console.error('❌ Error creating server index.js:', error);
}

// Update the package.json in the dist directory
const packageJson = {
  "name": "detailerops",
  "version": "1.0.0",
  "main": "index.js",
  "engines": {
    "node": "20.x"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "scripts": {
    "start": "node index.js"
  }
};

try {
  fs.writeFileSync(
    path.join(__dirname, 'dist', 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  console.log('✅ package.json created successfully');
} catch (error) {
  console.error('❌ Error creating package.json:', error);
}

console.log('✅ Netlify deployment files prepared successfully');