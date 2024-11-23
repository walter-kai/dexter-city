import React from "react";

export default function AccessTokenButton() {
  const handleAccessTokenClick = async () => {
    try {
      const response = await fetch("/api/plaid/getToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "client_credentials", // Example payload; adjust as needed.
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Link token:", data.link_token); // Handle the link token
        // You can now use this link token to initialize Plaid Link in the frontend
      } else {
        throw new Error("Failed to fetch link token");
      }
    } catch (error: any) {
      console.error("Error fetching link token:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={handleAccessTokenClick}
        className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Get Link Token
      </button>
    </div>
  );
}
