  import { Network, Alchemy, TokenAddressRequest, HistoricalPriceInterval } from "alchemy-sdk";
  import logger from "../config/logger";

  // Alchemy configuration
  const settings = {
    apiKey: "MRuDKd-23QrdzzG3CfQrxva3QsnRiTw6", // Replace with your Alchemy API key
    network: Network.ETH_MAINNET, // Set the network to the appropriate chain
  };

  const alchemy = new Alchemy(settings);

  /**
   * Fetch the price of tokens by their contract addresses.
   * @param addresses An array of contract addresses for the tokens.
   * @returns A map of addresses to their respective prices, or null if an error occurs.
   */
  const getPriceByAddress = async (addresses: string[]) => {
    try {
      // Convert string addresses to TokenAddressRequest objects
      const tokenRequests: TokenAddressRequest[] = addresses.map((address) => ({
        address: address,
        network: Network.ETH_MAINNET, // Ensure this matches your Alchemy configuration
      }));

      // Fetch prices using the Alchemy SDK
      const prices = await alchemy.prices.getTokenPriceByAddress(tokenRequests);

      if (!prices) {
        logger.warn(`No prices found for the provided addresses.`);
        return null;
      }

      logger.info(`Fetched prices: ${JSON.stringify(prices)}`);
      return prices;
    } catch (err) {
      logger.error(
        `Error fetching prices for addresses: ${addresses.join(", ")}. ${
          err instanceof Error ? err.message : "An error occurred"
        }`
      );
      return null;
    }
  };

  /**
   * Fetch historical prices of a token by its contract address over a specified period.
   * @param address The contract address of the token.
   * @param startTime The start timestamp (in seconds).
   * @param endTime The end timestamp (in seconds).
   * @param interval The interval for historical data (e.g., "1h").
   * @returns Historical prices or null if an error occurs.
   */
  const getHistory = async (
    address: string,
    interval: string, // Accept interval as a string input
    startTime: number,
    endTime?: number
  ) => {
    try {
      // Map the string intervals to HistoricalPriceInterval types
      const intervalMapping: Record<string, HistoricalPriceInterval> = {
        "5m": HistoricalPriceInterval.FIVE_MINUTE,
        "1h": HistoricalPriceInterval.ONE_HOUR,
        "1d": HistoricalPriceInterval.ONE_DAY,
      };
  
      // Validate if the provided interval is valid
      const mappedInterval = intervalMapping[interval];
      if (!mappedInterval) {
        logger.error(`Invalid interval: ${interval}. Valid intervals are: ${Object.keys(intervalMapping).join(", ")}`);
        return null;
      }
  
      // Default endTime to current time if not provided
      const endTimeCalculated = endTime ?? Math.floor(Date.now() / 1000);
  
      // Fetch historical prices using the Alchemy SDK
      const prices = await alchemy.prices.getHistoricalPriceByAddress(
        Network.ETH_MAINNET,
        address,
        startTime,
        endTimeCalculated,
        mappedInterval // Pass the mapped interval
      );
  
      if (!prices) {
        logger.warn(`No historical prices found for address: ${address}.`);
        return null;
      }
  
      logger.info(`Fetched historical prices for ${address}: ${JSON.stringify(prices)}`);
      return prices;
    } catch (err) {
      logger.error(
        `Error fetching historical prices for address: ${address}. ${
          err instanceof Error ? err.message : "An error occurred"
        }`
      );
      return null;
    }
  };

  export default {
    getPriceByAddress,
    getHistory
  };

  // // Example usage
  // (async () => {
  //   const tokenAddresses = [
  //     "0xA0b86991C6218b36c1d19D4a2e9Eb0cE3606eB48", // Example: USDC
  //     "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2", // Example: WETH
  //   ];

  //   const prices = await getPriceByAddress(tokenAddresses);
  //   console.log("Prices:", prices);
  // })();
