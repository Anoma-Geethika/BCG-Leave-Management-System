// Import required modules
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { registerRoutes } from '../server/routes.js';

// Create Express app
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.json());

// Register API routes
registerRoutes(app);

// Serve static files from the React frontend
app.use(express.static(join(__dirname, '../dist')));

// Route all non-API requests to the React frontend
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// Export for Vercel
export default app;