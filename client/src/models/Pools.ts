import { TokenDetails, TokenResponse } from './TokenDetails';

export interface PoolData {
    name: string;
    lastUpdated: Date;
    createdAtTimestamp: Date;
    network: "Ethereum";
    address: string;
    volumeUSD: number;
    txCount: number;
    date: string;
    feeTier: number;
    liquidity: string;
    token0Price: string;
    token0: TokenDetails;
    token1Price: string;
    token1: TokenDetails;
  }

  export interface PoolResponse {
    __typename: string;
    id: string;
    createdAtTimestamp: number;
    feeTier: number;
    liquidity: number;
    token0: TokenResponse;
    token1: TokenResponse;
    token0Price: number;
    token1Price: number;
    volumeUSD: number;
  }

  export interface PoolDayData {
    __typename: string;
    date: number;
    pool: PoolResponse;
  }

  // Updated to match actual GraphQL response
  export interface PoolsResponseData {
    poolDayDatas: PoolDayData[];
  }