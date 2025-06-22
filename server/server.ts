import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import { Server as WebSocketServer } from 'ws'; // WebSocket library
import subgraph from './routes/chain/subgraph/service'; // Import getPairs function
import routes from './routes';

// Load environment variables - fix the path to be absolute
config({ path: '.env' });

// // Add debug logging to verify the API key is loaded
// console.log('THEGRAPH_API_KEY loaded:', process.env.THEGRAPH_API_KEY ? 'YES' : 'NO');
// if (process.env.THEGRAPH_API_KEY) {
//   console.log('API Key length:', process.env.THEGRAPH_API_KEY.length);
// }

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(morgan('combined')); // Logs HTTP requests
app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, '../client/build')));
app.use("/api", routes);

// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: "API route not found" });
});

app.post('/', (req: Request, res: Response) => {
  res.redirect('/');
});

// Serve React application  
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

// Start HTTP server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

