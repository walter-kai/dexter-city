import { Request, Response } from "express";
import ApiError from "../utils/api-error";
import catchAsync from "../utils/catch-async";

import chainSubgraphService from "../services/chain.subgraph.service";

// List of token addresses to prepopulate the dropdown
const tokenAddresses: string[] = [
  "0x1151cb3d861920e07a38e03eead12c32178567f6", // 
  "0xad2afccec0384f272f430e763041f0ba4decbe27", // Trump
  "0x146d0fff5be0c7825f47ca0359c3070b12a4684b", // Alpha

];


const getTokens = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const tokenPools = await Promise.all(
    tokenAddresses.map(async (tokenAddress) => {
      const pools = await chainSubgraphService.reloadPools(tokenAddress);
      
      if (!pools || pools.length === 0) {
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
