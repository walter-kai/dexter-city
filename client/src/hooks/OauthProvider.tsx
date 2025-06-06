import React, { createContext, useContext, useState, useEffect } from "react";
import { useToken } from "./TokenProvider";

interface OAuthContextType {
    authCode: string | null;
    initiateOAuth: () => Promise<void>;
}

const OAuthContext = createContext<OAuthContextType | undefined>(undefined);

export const OAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authCode, setAuthCode] = useState<string | null>(null);

    const { privateToken, fetchPrivateToken } = useToken();

    useEffect(() => {
        const messageListener = async (event: MessageEvent) => {
            // Ensure the message comes from the same origin
            if (event.origin === window.location.origin && event.data?.authCode) {
                setAuthCode(event.data.authCode);
                console.log("Received auth code:", event.data.authCode); // Debug log

                // Fetch the private token using the authCode
                await fetchPrivateToken(event.data.authCode);
            }
        };

        // Add the event listener for messages from the popup
        window.addEventListener("message", messageListener);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener("message", messageListener);
        };
    }, [fetchPrivateToken]);

    const initiateOAuth = async () => {
        try {
            const response = await fetch("/api/oauth");
            const redirectLink = await response.json();

            if (redirectLink?.url) {
                const oauthWindow = window.open(redirectLink.url, '_blank', 'width=500,height=700');
                
                if (!oauthWindow) {
                    console.error("Popup blocked. Unable to open OAuth window.");
                }
            }
        } catch (error) {
            console.error("Error during OAuth call:", error);
        }
    };

    return (
        <OAuthContext.Provider value={{ authCode, initiateOAuth }}>
            {children}
        </OAuthContext.Provider>
    );
};

export const useOAuth = () => {
    const context = useContext(OAuthContext);
    if (!context) {
        throw new Error("useOAuth must be used within an OAuthProvider");
    }
    return context;
};
