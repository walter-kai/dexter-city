import React, { useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';

const OAuthLink = () => {
  // The Link token from the first Link initialization
  const linkToken = localStorage.getItem('link_token');

  const onSuccess = React.useCallback(async (public_token: string) => {
    // Send public_token to server to exchange for access_token
    try {
      const response = await fetch('/api/plaid/exchangePublicToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Access token:', data.access_token); // You can now use the access token to make authenticated requests
      } else {
        console.error('Failed to exchange public token');
      }
    } catch (error) {
      console.error('Error exchanging public token:', error);
    }
  }, []);

  const onExit = (err: any, metadata: any) => {
    // Handle error...
    console.log('Link exit:', err, metadata);
  };

  const config = {
    token: linkToken!,
    receivedRedirectUri: window.location.href,
    onSuccess,
    onExit,
  };

  const { open, ready, error } = usePlaidLink(config);

  // Automatically reinitialize Link
  useEffect(() => {
    if (ready) {
      open();
    }
  }, [ready, open]);

  return <></>;
};

export default OAuthLink;
