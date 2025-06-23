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
const port = 3001;

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

// Serve React application  
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../client/dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('index.html not found. Please build the client app.');
    }
  });
});

// Start HTTP server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

