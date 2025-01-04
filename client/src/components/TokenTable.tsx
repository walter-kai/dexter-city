import React from 'react';
import { cacheExchange, createClient, fetchExchange, Provider, useQuery } from 'urql';

const client = createClient({
    url: 'https://gateway.thegraph.com/api/cf949c81dc1152037b34ecdea916c0a8/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
    exchanges: [cacheExchange, fetchExchange],
});

const QUERY = `{
  tokens(first: 15, orderBy: volumeUSD, orderDirection: desc) {
    id
    name
    symbol
    derivedETH
    volumeUSD
    txCount
  }

  bundles(first: 1) {
    ethPriceUSD
  }
}`;

const TokenTable: React.FC = () => {
  const [result] = useQuery({ query: QUERY });
  const { data, fetching, error } = result;

  if (fetching) {
    return (
      <div className="flex justify-center items-center mt-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
        <p className="ml-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">Error: {error.message}</p>;
  }

  const ethPriceUSD = data.bundles[0].ethPriceUSD;

  return (
    <div className="overflow-x-auto mt-10 bg-black/70 text-white">
      <table className="min-w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100 text-black">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">#</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Token Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Symbol</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Price (USD)</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Volume (USD)</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Transaction Count</th>
          </tr>
        </thead>
        <tbody>
          {data.tokens.map((token: any, index: number) => (
            <tr key={token.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
              <td className="border border-gray-300 px-4 py-2">{token.name}</td>
              <td className="border border-gray-300 px-4 py-2">{token.symbol}</td>
              <td className="border border-gray-300 px-4 py-2">
                ${(token.derivedETH * ethPriceUSD).toFixed(2)}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                ${parseFloat(token.volumeUSD).toLocaleString()}
              </td>
              <td className="border border-gray-300 px-4 py-2">{token.txCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const WrappedTokenTable: React.FC = () => (
  <Provider value={client}>
    <TokenTable />
  </Provider>
);

export default WrappedTokenTable;
