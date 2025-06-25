import express, { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import routes from './routes';
import cron from './cron/route';

// Load environment variables
config({ path: '.env' });

const app = express();
const port = process.env.PORT || 3001;

// Enhanced logging for debugging
morgan.token('body', (req: Request) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :body'));

// Basic middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});

// Mount cron routes without any restrictions
console.log('Mounting cron routes at /cron');
app.use("/cron", cron);

// Mount API routes with origin restrictions
console.log('Mounting API routes at /api with origin restrictions');
app.use("/api", (req, res, next) => {
  const allowedOrigins = [
    "https://dexter.city",
    "https://dexter-city-882290629693.us-central1.run.app",
    "http://localhost:3000" // For local development
  ];
  
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  
  console.log(`API request from origin: ${origin}, referer: ${referer}`);
  
  if (
    (origin && allowedOrigins.includes(origin)) ||
    (referer && allowedOrigins.some(o => referer.startsWith(o))) ||
    process.env.NODE_ENV !== 'production' // Skip check in development
  ) {
    return next();
  }
  
  console.log('API access denied: invalid origin/referer');
  res.status(403).json({ error: "Forbidden" });
});
app.use("/api", routes);

// Handle API cron endpoints under /api/cron (for backwards compatibility)
app.use("/api/cron", cron);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: "API route not found" });
});

// Serve static files
app.use(express.static(path.join(__dirname, '../client/dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Start HTTP server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Available routes:');
  console.log(' - /cron/*');
  console.log(' - /api/cron/* (alias for /cron/*)');
  console.log(' - /api/*');
});

// Handle termination
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

