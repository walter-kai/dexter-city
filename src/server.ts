import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import { Server as WebSocketServer } from 'ws'; // WebSocket library
import subgraph from './routes/chain/chain.subgraph.service'; // Import getPairs function
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
app.use(express.static(path.join(__dirname, '../client/build')));
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
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start HTTP server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// WebSocket server setup
const wss = new WebSocketServer({ noServer: true }); // We will handle upgrades manually

// Handle WebSocket upgrades on /ws/prices
server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws/pairs') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy(); // Reject the connection if it's not for /ws/prices
  }
});

// Store WebSocket connections
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established.');

  // Function to fetch the pairs and send to the client
  const sendLivePrices = async () => {
    // try {
    //   const pairs = await subgraph.getPairs(); // Fetch the pairs data using getPairs function
    //   const updates = pairs ? pairs : [];

    //   // Send updates to the client
    //   if (ws.readyState === ws.OPEN) {
    //     ws.send(JSON.stringify({ type: 'pairUpdate', data: updates }));
    //   }
    // } catch (error) {
    //   console.error('Error fetching pairs:', error);
    //   if (ws.readyState === ws.OPEN) {
    //     ws.send(JSON.stringify({ type: 'error', message: 'Error fetching pairs updates' }));
    //   }
    // }
  };

  // Initial fetch when the connection is established
  sendLivePrices();

  // Setup to fetch updates periodically (e.g., every minute)
  const intervalId = setInterval(sendLivePrices, 100000); // 10 seconds

  // Cleanup when WebSocket disconnects
  ws.on('close', () => {
    console.log('WebSocket connection closed.');
    clearInterval(intervalId); // Clear the interval on disconnect
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });
});

console.log('WebSocket server is live!');
