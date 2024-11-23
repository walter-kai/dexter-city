import React, { useEffect, useState } from 'react';
import { Loading } from '../components/Loading';
import LoadingScreenDots from '../components/LoadingScreenDots';

const Profile: React.FC = () => {
  const [accountsData, setAccountsData] = useState<any[]>([]); // Store accounts data
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const fetchAccountsData = async () => {
      const accessToken = localStorage.getItem('access_token'); // Retrieve the access token from localStorage
      if (accessToken) {
        const response = await fetch('/api/plaid/accounts/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken }), // Send the access token in the body
        });
    
        if (response.ok) {
          const data = await response.json();
          setAccountsData(data.item)
          console.log('Item Data:', data.item); // Handle item data here
        } else {
          console.error('Failed to fetch item data');
        }
      } else {
        console.error('Access token not found');
      }
    };

    fetchAccountsData();
  }, []);

  return (
    <div className="container mx-auto">
      {accountsData.length === 0 ? (
        <LoadingScreenDots />
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          {/* Accounts Section */}
          <h3 className="mt-6 font-semibold text-lg">Accounts</h3>
          {accountsData.length > 0 ? (
            <ul>
              {accountsData.map((account, index) => (
                <li key={index} className="mb-4">
                  <p><strong>Account Name:</strong> {account.name}</p>
                  <p><strong>Type:</strong> {account.type}</p>
                  <p><strong>Current Balance:</strong> {account.balances?.current} {account.balances?.iso_currency_code}</p>
                  <p><strong>Account ID:</strong> {account.account_id}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No accounts available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
