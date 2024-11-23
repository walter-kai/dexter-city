import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import routes from './routes'; // Import your routes module

// Load environment variables
config({ path: '.env' });

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(morgan('combined'));  // Request logging
app.use(cors());              // Enable CORS
app.use(express.json());      // Parse JSON request bodies
app.use(express.static(path.join(__dirname, '../client/build'))); // Serve static files

// API routes
app.use('/api', routes); // Use the routes module for '/api' endpoints

// Serve React application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
