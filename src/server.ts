import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import path from 'path';
// import fetch from 'node-fetch';
import morgan from 'morgan'; 
import routes from './routes';

// Load environment variables
// config({ path: process.env.NODE_ENV === 'production' ? `.env.${process.env.NODE_ENV}` : '.env' });
config({ path: '.env' });

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(morgan('combined'));  // logs stuff
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));
app.use("/api", routes);


// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: "API route not found" });
});

app.post('/', (req: Request, res: Response) => {
  // Handle any processing for the POST request here if needed
  // Then redirect to the desired GET route (e.g., '/api/search')

  res.redirect('/');
});


// Serve React application
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
