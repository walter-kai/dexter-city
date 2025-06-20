export interface TokenDetails {
  address: string;
  symbol: string;
  name: string;
  imgId: number;
  volume: number;
  price: number;
  date_added: string;
  tags: string[];
}

export interface TokenResponse {
  __typename: string;
  id: string;
  name: string;
  symbol: string;
  volumeUSD: string;
}

export interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  derivedETH: number;
  tradeVolumeUSD: number;
  totalLiquidity: number;
}
