export namespace coinmarketcap {
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
    base_asset_name: string;
    base_asset_symbol: string;
    contract_address: string;
    created_at: string;
    dex_id: string;
    dex_slug: string;
    lastUpdated: string;
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
      quote_asset_contract_address: string;
      quote_asset_id: string;
      quote_asset_name: string;
      quote_asset_symbol: string;
    }>;
  }
  
}
