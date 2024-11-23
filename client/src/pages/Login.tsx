import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const navigate = useNavigate(); // Hook to navigate to different routes

  // Fetch the link token when the component mounts
  useEffect(() => {
    const fetchLinkToken = async () => {
      const response = await fetch('/api/plaid/getToken', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setLinkToken(data.link_token);
      } else {
        console.error('Error fetching link token');
      }
    };

    fetchLinkToken();
  }, []);

  // Success handler when the user successfully connects their account
  const handleLinkSuccess = async (publicToken: string) => {
    const response = await fetch('/api/plaid/exchangePublicToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_token: publicToken }),
    });
    const data = await response.json();
    const accessToken = data.access_token;

    console.log('Access token:', accessToken);

    // Store the access token in local storage
    localStorage.setItem('access_token', accessToken);

    // Redirect to the profile page after successful connection
    navigate('/profile'); // Redirect to /profile page
  };

  // Exit handler in case of an error or if the user exits the flow
  const handleLinkExit = (error: any, metadata: any) => {
    console.log('Link exit:', error, metadata);
  };

  // If the link token isn't ready yet, show a loading message
  if (!linkToken) return <div>Loading...</div>;

  // Initialize the Plaid Link handler
  const handler = window.Plaid.create({
    token: linkToken,
    onSuccess: handleLinkSuccess,
    onExit: handleLinkExit,
  });

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={() => handler.open()} // Trigger the Plaid Link flow
        className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Connect Bank Account
      </button>
    </div>
  );
}
