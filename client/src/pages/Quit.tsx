import React, { useEffect, useState } from 'react';

const Quit: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('auth');

    if (authCode && window.opener) {
      console.log("Sending auth code to opener:", authCode); // Debug log

      // Send the auth code back to the opener window
      window.opener.postMessage({ authCode }, window.location.origin);
      window.close(); // Close the current window (popup)
    } else {
      setError("Authorization code not found."); // Set the error message
    }
  }, []);

  return (
    <div>
      {error ? (
        <>
          <h1>Error</h1>
          <p>{error}</p>
        </>
      ) : (
        <>
          <h1>Closing...</h1>
          <p>If you see this, the authentication was successful!</p>
        </>
      )}
    </div>
  );
};

export default Quit;
