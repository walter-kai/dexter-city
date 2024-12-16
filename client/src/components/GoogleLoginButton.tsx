import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
// import { UserContext } from "../App";
import { GoogleLogin } from "@react-oauth/google";

const GoogleLoginButton: React.FC = () => {
  const navigate = useNavigate();
  // const { setCurrentUser } = useContext(UserContext);

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    const credential = credentialResponse.credential;
  
    // Send the credential to your backend for verification
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
      credentials: 'include', // Include cookies in the request
    });
  
    if (response.ok) {
      const data = await response.json();
      console.log('User authenticated:', data);
  
      // Set user data in context
      // setCurrentUser(data);
      sessionStorage.setItem('current_user', JSON.stringify(data)); // Store link token in sessionStorage

  
      // Redirect to profile
      navigate('/');
    } else {
      console.error('Error authenticating user');
    }
  };

  return (
    <GoogleLogin
    onSuccess={credentialResponse => {
      // console.log(credentialResponse);
      handleGoogleLoginSuccess(credentialResponse);
    }}
    onError={() => {
      console.log('Login Failed');
    }}
    useOneTap
/>
  );
};

export default GoogleLoginButton;
