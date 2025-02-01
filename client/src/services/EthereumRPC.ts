import { ethers, Contract } from "ethers";

interface LivePriceParams {
  poolAddress: string;
  timeAgo: Date;
  tickInterval: number;
}

export class LivePriceFetcher {
  private provider: ethers.WebSocketProvider;
  private poolContract: Contract;
  private poolAbi: string[];

  constructor(
    private params: LivePriceParams,
    private onUpdate: (price: number, observations: { tick: string; price: number }[]) => void
  ) {
    // this.provider = new ethers.WebSocketProvider(params.providerUrl);
    this.provider = new ethers.WebSocketProvider("wss://eth-mainnet.g.alchemy.com/v2/MRuDKd-23QrdzzG3CfQrxva3QsnRiTw6");

    this.poolAbi = [
      "function token0() external view returns (address)",
      "function token1() external view returns (address)",
      "function slot0() external view returns (uint160, int24, uint16, uint16, uint16, uint8, bool)",
      "function observe(uint32[]) external view returns (int56[] tickCumulatives, uint160[] secondsPerLiquidityCumulativeX128s)",
    ];

    this.poolContract = new Contract(params.poolAddress, this.poolAbi, this.provider);
  }

  private async fetchDecimals(tokenAddress: string): Promise<number> {
    const tokenAbi = ["function decimals() external view returns (uint8)"];
    const tokenContract = new Contract(tokenAddress, tokenAbi, this.provider);
    return await tokenContract.decimals();
  }

  private async fetchLatestPrice(): Promise<number | null> {
    try {
      const slot0 = await this.poolContract.slot0();
      const tick = slot0[1];

      const token0Address = await this.poolContract.token0();
      const token1Address = await this.poolContract.token1();

      const token0Decimals = await this.fetchDecimals(token0Address);
      const token1Decimals = await this.fetchDecimals(token1Address);
      return Math.pow(1.0001, Number(tick)) * 10 ** (token0Decimals - token1Decimals);
    } catch (error) {
      console.error("Error fetching price:", error);
      return null;
    }
  }

  private async fetchObservations(): Promise<{ tick: string; price: number }[]> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const pastTimestamp = Math.floor(this.params.timeAgo.getTime() / 1000);
      const timeAgoSeconds = now - pastTimestamp;

      if (timeAgoSeconds <= 0) {
        console.warn("Invalid timeAgo value (should be in the past).");
        return [];
      }

      const observationIntervals: number[] = [];
      for (let t = 0; t <= timeAgoSeconds; t += this.params.tickInterval) {
        observationIntervals.push(timeAgoSeconds - t);
      }

      if (observationIntervals.length < 2) {
        console.warn("Insufficient observation intervals.");
        return [];
      }

      const [tickCumulatives] = await this.poolContract.observe(observationIntervals);

      const token0Address = await this.poolContract.token0();
      const token1Address = await this.poolContract.token1();

      const token0Decimals = await this.fetchDecimals(token0Address);
      const token1Decimals = await this.fetchDecimals(token1Address);

      return tickCumulatives.slice(0, -1).map((tickCum: number, i: number) => {
        const tickDelta = Number(tickCumulatives[i + 1]) - Number(tickCum);
        const timeDelta = observationIntervals[i] - observationIntervals[i + 1];

        if (timeDelta <= 0) return { tick: "0", price: 0 };

        const avgTick = tickDelta / timeDelta;
        const avgPrice = Math.pow(1.0001, avgTick) * 10 ** (token0Decimals - token1Decimals);

        return { tick: avgTick.toFixed(2), price: avgPrice };
      });
    } catch (error) {
      console.error("Error fetching observations:", error);
      return [];
    }
  }

  private async updateData() {
    const price = await this.fetchLatestPrice();
    const observations = await this.fetchObservations();

    if (price !== null) {
      this.onUpdate(price, observations);
    }
  }

  public startListening() {
    this.updateData(); // Initial fetch
    this.provider.on("block", async () => {
      await this.updateData();
    });
  }

  public stopListening() {
    this.provider.removeAllListeners();
    this.provider.destroy();
  }
}
