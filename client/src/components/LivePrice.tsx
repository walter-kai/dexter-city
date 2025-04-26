'use client';

import React, { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { getPoolImmutables, getPoolState } from '../services/UniswapV3';

interface LivePriceProps {
  poolAddress: string;
  baseCurrency: string; // Symbol of the base currency
  quoteCurrency: string; // Symbol of the quote currency
}

const LivePrice: React.FC<LivePriceProps> = ({ poolAddress, baseCurrency, quoteCurrency }) => {
  const [price, setPrice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const client = createPublicClient({
          chain: mainnet,
          transport: http(),
        });

        const immutables = await getPoolImmutables(poolAddress as `0x${string}`, client);
        const state = await getPoolState(poolAddress as `0x${string}`, client);

        // Calculate live price directly from pool state
        const sqrtPriceX96 = BigInt(state.sqrtPriceX96 as string);
        const price = (Number(sqrtPriceX96) ** 2) / 2 ** 192; // Simplified price calculation
        setPrice(price.toFixed(6));
      } catch (err) {
        console.error('Error fetching price:', err);
        setError('Failed to fetch live price.');
      }
    };

    if (poolAddress) {
      fetchPrice();
    }
  }, [poolAddress]);

  return (
    <div className="mt-4 p-4 bg-gray-700 rounded text-white">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : price ? (
        <p>
          Live price: 1 {quoteCurrency} = {price} {baseCurrency}
        </p>
      ) : (
        <p>Loading live price...</p>
      )}
    </div>
  );
};

export default LivePrice;
