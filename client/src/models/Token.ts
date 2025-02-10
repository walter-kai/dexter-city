export namespace CoinMarketCap {
  export interface Platform {
    id: number;
    name: string;
    slug: string;
    symbol: string;
    token_address: string;
  }

  export interface CryptoAsset {
    circulating_supply: number;
    cmc_rank: number;
    date_added: string;  // ISO 8601 format string
    id: number;
    infinite_supply: boolean;
    lastUpdated: string;  // Timestamp string (ISO 8601)
    last_updated: string;  // ISO 8601 format string
    max_supply: number | null;
    name: string;
    num_market_pairs: number;
    platform: Platform;
    self_reported_circulating_supply: number;
    self_reported_market_cap: number;
    slug: string;
    symbol: string;
    tags: string[];
    total_supply: number;
    tvl_ratio: number | null;
  }

  // Adding Token type
  export interface Token {
    id: number;
    contract_address: string;
    name: string;
    symbol: string;
    decimals: number;
    total_supply: number;
    platform: Platform;
    price_usd: number;
    market_cap_usd: number;
    circulating_supply: number;
    volume_24h: number;
    price_change_24h: number;
    last_updated: string;  // ISO 8601 format string
  }

  export interface TradingPair {
    base_asset_contract_address: string;
    base_asset_id: string;
    base_asset_ucid: string;
    base_asset_name: string;
    base_asset_symbol: string;
    quote_asset_contract_address: string;
    quote_asset_id: string;
    quote_asset_ucid: string;
    quote_asset_name: string;
    quote_asset_symbol: string;
    contract_address: string;
    created_at: string;
    dex_id: string;
    dex_slug: string;
    last_updated: string;
    name: string;
    network_id: string;
    network_slug: string;
    quote: Array<{
      convert_id: string;
      fully_diluted_value: number;
      last_updated: string;
      liquidity: number;
      percent_change_price_1h: number;
      percent_change_price_24h: number;
      price: number;
      price_by_quote_asset: number;
      volume_24h: number;

    }>;
  }

  export interface Trades
    {
        date: Date,
        type: "sell" | "buy",
        quote: [
            {
                price: number,
                total: number,
                convert_id: string,
                price_by_quote_asset: number,
                amount_base_asset: number,
                amount_quote_asset: number
            }
        ]
    }
  
}

export namespace Subgraph {

    // Define TypeScript types for queries
  export interface GlobalStats {
    totalVolumeUSD: number;
    totalLiquidityUSD: number;
    txCount: number;
  }

  export interface TokenDetails {
    symbol: string;
    name: string;
    tradeVolume: number;
    totalLiquidity: number;
    totalSupply: number;
  }

  export interface PairData {
    name: string;
    network: "Ethereum";
    id: string;
    txCount: number;
    volumeUSD: number;
    volumeToken0: number;
    token0Price: number;
    // token0: TokenDetails;
    token0ImgId: number,
    volumeToken1: number;
    token1Price: number;
    // token1: TokenDetails;
    token1ImgId: number,
    
  }

  
  export interface SwapData {
    amount0In: number;
    amount0Out: number;
    amount1In: number;
    amount1Out: number;
    amountUSD: number;
    timestamp: number;
  }

  export interface TokenData {
    name: string;
    symbol: string;
    decimals: number;
    derivedETH: number;
    tradeVolumeUSD: number;
    totalLiquidity: number;
  }

  export interface DailyAggregatedData {
    date: string;
    dailyVolumeToken0: number;
    dailyVolumeToken1: number;
    dailyVolumeUSD: number;
    reserveUSD: number;
  }

  export interface ETHPrice {
    ethPrice: number;
  }
}
