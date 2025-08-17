import React, { useEffect, useState, useRef } from "react";
import { useSDK } from "@metamask/sdk-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
import { userApi } from "../../utils/userApi";
import { User } from "../../types/User";
import { CSSTransition, SwitchTransition } from 'react-transition-group';
// import '../../styles/fading.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { sdk, connected } = useSDK();
  const navigate = useNavigate();
  const { setUser, user, connectWallet: authConnectWallet, authError, forceDisconnectMetaMask, closeLoginModal } = useAuth();

  const [show, setShow] = useState(false);
  const [step, setStep] = useState<'connect' | 'form'>('connect');
  const [walletId, setWalletId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [referral, setReferral] = useState('');
  const [error, setError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShow(false);
      setTimeout(() => setShow(true), 10);
      setStep('connect');
      setWalletId(null);
      setUsername('');
      setReferral('');
      setError('');
      setIsConnecting(false); // Reset connecting state when opening
    } else {
      setShow(false);
      // Force disconnect MetaMask if modal is closed and not authenticated
      if ((connected || isConnecting) && !user) {
        forceDisconnectMetaMask();
        sdk?.terminate();
      }
      // Reset any error states and connection state when modal is closed
      setError('');
      setIsConnecting(false);
    }
  }, [isOpen, connected, isConnecting, user, sdk, forceDisconnectMetaMask]);

  // Update error state when authError changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const connectWallet = async () => {
    try {
      setError('');
      setIsConnecting(true);
      
      // Add a timeout to handle cases where MetaMask modal is closed
      const connectPromise = authConnectWallet();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout - please try again')), 30000);
      });
      
      const authenticatedUser = await Promise.race([connectPromise, timeoutPromise]) as User | null;
      
      if (authenticatedUser) {
        if (!authenticatedUser.username) {
          // New user or user without username - show form
          setWalletId(authenticatedUser.walletAddress);
          setStep('form');
        } else {
          // Existing user with username - redirect to dashboard
          navigate("/i/dashboard");
          onClose();
        }
      }
    } catch (err: any) {
      console.error('MetaMask connection error:', err);
      
      // Force disconnect MetaMask on any error to prevent hanging states
      try {
        await forceDisconnectMetaMask();
      } catch (disconnectErr) {
        console.error('Error force disconnecting:', disconnectErr);
      }
      
      // Handle specific error cases
      if (err?.code === 4001) {
        setError('Connection rejected by user');
      } else if (err?.message?.includes('timeout')) {
        setError('Connection timed out - please try again');
      } else if (err?.message?.includes('User rejected')) {
        setError('Connection cancelled by user');
      } else {
        const errorMessage = err?.message || err?.toString() || "Failed to connect MetaMask.";
        setError(errorMessage);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId || !username) {
      setError('Wallet ID and username are required');
      return;
    }

    try {
      // Update user with username via server API
      const updatedUser = await userApi.updateUser({
        username: username.trim(),
        ...(referral.trim() && { referralId: referral.trim() }),
      });

      // Update local state
      setUser(updatedUser);
      navigate("/i/dashboard");
      onClose();
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err?.message || 'Failed to update user profile');
    }
  };
  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch(`/api/user/checkName?username=${usernameToCheck}`);
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);

    // Clear previous timeout
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }

    // Set new timeout for username check
    const timeout = setTimeout(() => {
      checkUsernameAvailability(newUsername);
    }, 500);

    setUsernameCheckTimeout(timeout);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-[#23263a] w-full max-w-md rounded-lg p-8 relative border border-[#00ffe7]/30 shadow-[0_0_24px_#00ffe7]">
        <button
          onClick={() => {
            closeLoginModal(); // This resets the connection state
            onClose(); // This triggers the parent component's close handler
          }}
          className="absolute z-10 top-4 right-4 bg-[#181a23] p-2 rounded-full hover:bg-[#00ffe7] hover:text-[#181a23] text-[#00ffe7] shadow-[0_0_8px_#00ffe7] transition"
        >
          ✕
        </button>
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={step}
            classNames="fade"
            timeout={400}
            unmountOnExit
            nodeRef={nodeRef}
          >
            <div ref={nodeRef}>
              {step === 'connect' && (
                <>
                  <h2 className="text-2xl font-bold text-center text-[#00ffe7] mb-6 drop-shadow-[0_0_8px_#00ffe7]">
                    Connect Your Wallet
                  </h2>
                  <div className="text-center mb-6">
                    <p className="text-[#e0e7ef] mb-4">
                      Connect your MetaMask wallet to access Dexter City's trading bots and features.
                    </p>
                  </div>
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className={`w-full font-bold py-3 px-6 rounded transition-all duration-500 ${
                      isConnecting 
                        ? "bg-orange-500 text-white shadow-[0_0_8px_orange] hover:shadow-[0_0_16px_orange]"
                        : "bg-[#00ffe7] text-[#181a23] hover:bg-[#ff005c] hover:text-white shadow-[0_0_8px_#00ffe7] hover:shadow-[0_0_16px_#ff005c]"
                    } disabled:opacity-50`}
                  >
                    {isConnecting ? "Connecting..." : "Connect MetaMask"}
                  </button>
                  <div className="mt-4 text-center">
                    <p className="text-[#e0e7ef] text-sm">
                      Don't have MetaMask?
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00ffe7] hover:text-[#ff005c] transition ml-1"
                      >
                        Download here
                      </a>
                    </p>
                  </div>
                  {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                </>
              )}
              {step === 'form' && (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <h2 className="text-2xl font-bold text-center text-[#00ffe7] mb-6 drop-shadow-[0_0_8px_#00ffe7]">
                    Set up your Dexter City account
                  </h2>
                  <div>
                    <label className="block text-[#e0e7ef] mb-2 font-semibold">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      className="w-full px-4 py-3 bg-[#181a23] border border-[#00ffe7]/30 rounded-lg text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7]"
                      placeholder="Choose a username"
                      required
                    />
                    {!checkingUsername && username.length < 3 && (
                        <span className="text-xs text-white ml-2">
                          Username must be at least 3 characters (example: 🦄🦕🤖)
                        </span>
                    )}                    {checkingUsername && username.length >= 3 && (
                      <span className="text-xs text-[#00ffe7] ml-2">Checking availability...</span>
                    )}
                    {username && username.length >= 3 && usernameAvailable === false && !checkingUsername && (
                      <span className="text-xs text-red-500 ml-2">Username is taken</span>
                    )}
                    {username && username.length >= 3 && usernameAvailable === true && !checkingUsername && (
                      <span className="text-xs text-green-400 ml-2">Username is available</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[#e0e7ef] mb-2 font-semibold">Referral (Get 1000 commission-free trades)</label>
                    <input
                      type="text"
                      value={referral}
                      onChange={e => setReferral(e.target.value)}
                      className="w-full px-4 py-3 bg-[#181a23] border border-[#00ffe7]/30 rounded-lg text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7]"
                      placeholder="Referral code or username (optional)"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#00ffe7] text-[#181a23] font-bold py-3 px-6 rounded hover:bg-[#ff005c] hover:text-white shadow-[0_0_8px_#00ffe7] hover:shadow-[0_0_16px_#ff005c] transition"
                    disabled={!username || username.length < 3 || checkingUsername || usernameAvailable !== true}
                  >
                    Continue
                  </button>
                  {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                </form>
              )}
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
    </div>
  );
};

export default LoginModal;
