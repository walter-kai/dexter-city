import { Request, Response } from "express";
import ApiError from "../utils/api-error";
import catchAsync from "../utils/catch-async";

import chainSubgraphService from "../services/chain.subgraph.service";

// List of token addresses to prepopulate the dropdown
const tokenAddresses: string[] = [
  "0x4256424ec9239a4ab069aaece123919ef263fe7e", // GDOG
  "0x866a1a2c2ff8230dc44c5433f93ef478f6c8afcc", // LuckyGem
  "0x146d0fff5be0c7825f47ca0359c3070b12a4684b", // Alpha
  "0xd29da236dd4aac627346e1bba06a619e8c22d7c5", // MAGA

];


const getTokens = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const tokenPools = await Promise.all(
    tokenAddresses.map(async (tokenAddress) => {
      const pools = await chainSubgraphService.reloadPools(tokenAddress);
      
      if (pools == undefined || pools.length === 0) {
        return res.status(404).json({ message: `No pools found for token address ${tokenAddress}` });
      }
      
      return {
        token: await chainSubgraphService.getToken(tokenAddress),
        poolId: pools[0].id // Select first pool's ID if available
      };
    })
  );



  return res.status(200).json(tokenPools);
});

export default {
  getTokens
};
