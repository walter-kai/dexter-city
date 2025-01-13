import PairDetails from "../components/PairDetails";
import { CoinMarketCap, Subgraph } from "../models/Token";

type PairUpdateCallback = (pairDetails: Subgraph.PairData) => void;
type ErrorCallback = (error: string) => void;

export class WebSocketService {
  private websocket: WebSocket | null = null;
  private pairDetails: Record<string, Subgraph.PairData> = {};
  private callbacks: Record<string, PairUpdateCallback[]> = {};
  private globalCallbacks: PairUpdateCallback[] = []; // New array for global "all pairs" subscribers
  private errorCallback: ErrorCallback | null = null;
  private reconnectAttempts = 0;

  public connect(): void {
    if (this.websocket) return;

    this.websocket = new WebSocket("ws://localhost:3001/ws/pairs");

    this.websocket.onopen = () => {
      console.log("WebSocket connection established.");
      this.reconnectAttempts = 0; // Reset reconnect attempts
    };

    this.websocket.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (message.type === "pairUpdate") {
        message.data.forEach((pair: Subgraph.PairData) => {
          this.pairDetails[pair.name] = pair;
          // Notify all subscribers for this specific pair
          if (this.callbacks[pair.name]) {
            this.callbacks[pair.name].forEach((callback) => callback(pair));
          }

          // Notify global subscribers (all pairs)
          if (this.callbacks["all"]) {
            this.callbacks["all"].forEach((callback) => callback(pair));
          }


          // Notify global subscribers for all pairs (if any)
          this.globalCallbacks.forEach((callback) => callback(pair));

          // Persist updated data to localStorage
          // localStorage.setItem("pairDetails", JSON.stringify(this.pairDetails));
        });
      }
    };

    this.websocket.onerror = (err: Event) => {
      console.error("WebSocket error:", err);
      if (this.errorCallback) {
        this.errorCallback("Error connecting to WebSocket server");
      }
    };

    this.websocket.onclose = () => {
      console.log("WebSocket connection closed.");
      this.websocket = null; // Reset the websocket reference on close
      this.reconnect(); // Attempt to reconnect
    };
  }

  private reconnect(): void {
    if (this.websocket || this.reconnectAttempts >= 5) return; // Limit reconnect attempts

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000); // Exponential backoff
    console.log(`Reconnecting in ${delay / 1000} seconds...`);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  // Subscribe to a specific pair by name
  public subscribeToPair(pairName: string, callback: PairUpdateCallback): void {
    if (!this.callbacks[pairName]) {
      this.callbacks[pairName] = [];
    }
    this.callbacks[pairName].push(callback);
  }

  // Unsubscribe from a specific pair by name
  public unsubscribeFromPair(pairName: string, callback: PairUpdateCallback): void {
    if (!this.callbacks[pairName]) return;

    this.callbacks[pairName] = this.callbacks[pairName].filter(
      (cb) => cb !== callback
    );

    // Clean up if no more callbacks are listening for this pair
    if (this.callbacks[pairName].length === 0) {
      delete this.callbacks[pairName];
    }
  }

  // Subscribe to all pairs (global subscription)
  public subscribeToAllPairs(callback: PairUpdateCallback): void {
    this.globalCallbacks.push(callback);
  }

  // Unsubscribe from all pairs
  public unsubscribeFromAllPairs(callback: PairUpdateCallback): void {
    this.globalCallbacks = this.globalCallbacks.filter((cb) => cb !== callback);
  }

  public getPairDetails(pairName: string): Subgraph.PairData | undefined {
    return this.pairDetails[pairName];
  }

  public getAll(): Promise<Record<string, Subgraph.PairData>> {
    return Promise.resolve(this.pairDetails); // Return the cached pairs
  }

  public onError(callback: ErrorCallback): void {
    this.errorCallback = callback;
  }

  public disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}


