import PairDetails from "@/components/PairDetails";
import { coinmarketcap } from "../models/Token";

type PairUpdateCallback = (pairDetails: coinmarketcap.TradingPair) => void;
type ErrorCallback = (error: string) => void;

class WebSocketService {
  private websocket: WebSocket | null = null;
  private pairDetails: Record<string, coinmarketcap.TradingPair> = {};
  private callbacks: Record<string, PairUpdateCallback[]> = {};
  private errorCallback: ErrorCallback | null = null;

  public connect(): void {
    if (this.websocket) return;

    this.websocket = new WebSocket("ws://localhost:3001/ws/pairs");

    this.websocket.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (message.type === "pairUpdate") {
        message.data.forEach((pair: coinmarketcap.TradingPair) => {
          this.pairDetails[pair.name] = pair;

          // Notify all subscribers for this pair
          const callbacks = this.callbacks[pair.name] || [];
          callbacks.forEach((callback) => callback(pair));
        });
      } else if (message.type === "error" && this.errorCallback) {
        this.errorCallback(message.message);
      }
    };

    this.websocket.onerror = (err: Event) => {
      console.error("WebSocket error:", err);
      if (this.errorCallback) {
        this.errorCallback("Error connecting to WebSocket server");
      }
    };

    this.websocket.onclose = () => {
      console.log("WebSocket connection closed");
      this.websocket = null;
    };
  }

  public subscribeToPair(
    tradingPair: string,
    callback: PairUpdateCallback
  ): void {
    if (!this.callbacks[tradingPair]) {
      this.callbacks[tradingPair] = [];
    }
    this.callbacks[tradingPair].push(callback);
  }

  public getAll(): Record<string, coinmarketcap.TradingPair> {
    return this.pairDetails;
  }

  public setErrorCallback(callback: ErrorCallback): void {
    this.errorCallback = callback;
  }

  public disconnect(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.close();
    }
  }
}

const websocketService = new WebSocketService();
websocketService.connect();
export default websocketService;
