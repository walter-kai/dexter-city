import React from 'react';
import { useTokensQuery } from '../services/SubGraph';

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center mt-10">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
    <p className="ml-4 text-gray-600">Loading...</p>
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-center text-red-500 mt-10">{`Error: ${message}`}</p>
);

const TokenTable: React.FC = () => {
  const [{ data, fetching, error }] = useTokensQuery();

  if (fetching) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  const ethPriceUSD = data?.bundles[0]?.ethPriceUSD;

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
          {data?.tokens.map((token, index) => (
            <tr key={token.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
              <td className="border border-gray-300 px-4 py-2">{token.name}</td>
              <td className="border border-gray-300 px-4 py-2">{token.symbol}</td>
              <td className="border border-gray-300 px-4 py-2">
                ${(parseFloat(token.derivedETH) * parseFloat(ethPriceUSD || '0')).toFixed(2)}
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



const WrappedTokenTable: React.FC = () => <TokenTable />;

export { WrappedTokenTable };
