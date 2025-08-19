import React, { useEffect, useState, useRef } from "react";
import { useSDK } from "@metamask/sdk-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
import { useMetaMaskAuth } from "../../hooks/useMetaMaskAuth";
import { userApi } from "../../utils/userApi";
import { User } from "../../types/User";
import StatusPopup from './StatusPopup';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { sdk, connected } = useSDK();
  const navigate = useNavigate();
  const { setUser, user, closeLoginModal } = useAuth();
  
  // Use MetaMask hook directly in the modal
  const { connectMetaMask, forceDisconnectMetaMask, error: authError, resetConnectionState } = useMetaMaskAuth();

  const [show, setShow] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [referral, setReferral] = useState('');
  const [statusMessage, setStatusMessage] = useState<{type: 'loading' | 'success' | 'error', message: string} | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [profilePictureId, setProfilePictureId] = useState<number>(Math.floor(Math.random() * 10000));
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShow(false);
      setTimeout(() => setShow(true), 10);
      setShowUsernameModal(false);
      setUsername('');
      setEmail('');
      setReferral('');
      setStatusMessage(null);
      setIsConnecting(false);
      setProfilePictureId(Math.floor(Math.random() * 10000));
    } else {
      setShow(false);
      setStatusMessage(null);
      setIsConnecting(false);
      setShowUsernameModal(false);
      // Reset MetaMask connection state when modal closes
      resetConnectionState();
    }
  }, [isOpen, resetConnectionState]);

  // Update error state when authError changes
  useEffect(() => {
    if (authError) {
      setStatusMessage({ type: 'error', message: authError });
    }
  }, [authError]);

  const connectWallet = async () => {
    try {
      setStatusMessage(null);
      setIsConnecting(true);
      
      const authenticatedUser = await connectMetaMask() as User | null;
      
      if (authenticatedUser) {
        // Update context state
        setUser(authenticatedUser);
        
        if (!authenticatedUser.username || authenticatedUser.username === '') {
          // New user without username - show username modal
          setShowUsernameModal(true);
        } else {
          // Existing user with username - close modal and redirect to dashboard
          closeLoginModal();
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
        setStatusMessage({ type: 'error', message: 'Connection rejected by user' });
      } else if (err?.message?.includes('User rejected')) {
        setStatusMessage({ type: 'error', message: 'Connection cancelled by user' });
      } else {
        const errorMessage = err?.message || err?.toString() || "Failed to connect MetaMask.";
        setStatusMessage({ type: 'error', message: errorMessage });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || username.length < 3) {
      setStatusMessage({ type: 'error', message: 'Username must be at least 3 characters' });
      return;
    }

    if (usernameAvailable !== true) {
      setStatusMessage({ type: 'error', message: 'Please choose an available username' });
      return;
    }

    try {
      // Update user with username via server API
      const updatedUser = await userApi.updateUser({
        username: username.trim(),
        ...(email.trim() && { email: email.trim() }),
        ...(referral.trim() && { referralId: referral.trim() }),
      });

      // Update local state
      setUser(updatedUser);
      closeLoginModal();
      navigate("/i/dashboard");
      onClose();
    } catch (err: any) {
      console.error('Error updating user:', err);
      setStatusMessage({ type: 'error', message: err?.message || 'Failed to update user profile' });
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

  const validateEmail = (emailToValidate: string) => {
    if (!emailToValidate.trim()) {
      setEmailValid(null); // Empty email is valid (optional field)
      return;
    }
    
    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const isValid = emailRegex.test(emailToValidate.trim());
    
    // Additional validation checks
    const hasValidLength = emailToValidate.trim().length <= 254; // RFC 5321 limit
    const parts = emailToValidate.split('@');
    const localPart = parts[0];
    const hasValidLocalPart = localPart && localPart.length <= 64; // RFC 5321 limit
    
    setEmailValid(isValid && hasValidLength && Boolean(hasValidLocalPart));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
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

  const regenerateProfilePicture = () => {
    setProfilePictureId(Math.floor(Math.random() * 10000));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[30] transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-[#23263a] w-full max-w-lg rounded-lg p-8 relative border border-[#00ffe7]/30 shadow-[0_0_24px_#00ffe7]">
          {!showUsernameModal && (
            <button
              onClick={() => {
                forceDisconnectMetaMask();
                closeLoginModal();
                onClose();
              }}
              className="absolute z-10 top-4 right-4 bg-[#181a23] p-2 rounded-full hover:bg-[#00ffe7] hover:text-[#181a23] text-[#00ffe7] shadow-[0_0_8px_#00ffe7] transition"
            >
              ✕
            </button>
          )}
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-[#00ffe7] mb-6 drop-shadow-[0_0_8px_#00ffe7]">
              {showUsernameModal ? "Complete Your Registration" : "Dexter City Homeland Security"}
            </h2>

            {!showUsernameModal ? (
              /* Initial MetaMask Connection */
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-[#e0e7ef] text-lg">
                    Welcome to Dexter City! Connect your MetaMask wallet to enter the city.
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className={`w-full font-bold py-4 px-6 rounded transition-all duration-500 ${
                      isConnecting 
                        ? "bg-orange-500 text-white shadow-[0_0_8px_orange] hover:shadow-[0_0_16px_orange]"
                        : "bg-[#00ffe7] text-[#181a23] hover:bg-[#ff005c] hover:text-white shadow-[0_0_8px_#00ffe7] hover:shadow-[0_0_16px_#ff005c]"
                    }`}
                  >
                    {isConnecting ? "Connecting..." : "Connect with MetaMask"}
                  </button>

                  <div className="text-center">
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
                </div>
              </div>
            ) : (
              /* Username Registration Modal */
              <form onSubmit={handleUsernameSubmit} className="space-y-6">
                {(() => {
                  const isSubmitDisabled = username.length < 3 || usernameAvailable !== true || checkingUsername || (email.trim() !== '' && emailValid === false);
                  
                  return (
                    <div className="bg-gradient-to-r from-[#181a23] to-[#23263a] border border-[#00ffe7]/50 rounded-lg p-6 shadow-[0_0_16px_#00ffe7/20]">
                      <div className="flex items-start space-x-4">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <img
                              src={`https://robohash.org/dextercity-${username || 'default'}?set=set1&size=300x400`}
                              alt={`Citizen ${profilePictureId}`}
                              className="w-30 h-40 rounded-lg border-2 border-[#00ffe7] shadow-lg bg-[#181a23] transition-all duration-500"
                            />
                          </div>
                          {/* Status Badge */}
                          <div className="items-center space-y-2 mt-6">
                            <div>
                              <div className="text-xs text-[#e0e7ef]">ISSUED BY:</div>
                              <span
                                className="neon-text tracking-widest font-savate text-base italic"
                              >
                                D<span className='text-xs'>EXTER</span>C<span className='text-xs'>ITY</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="flex-1 space-y-4">
                          <div>
                            <label className="block text-[#e0e7ef] text-sm font-semibold mb-1 flex items-center justify-between">
                              <span>CITIZEN NAME</span>
                              <span>
                              {username.length < 3 && (
                                <span className="text-xs text-orange-400">
                                Minimum 3 characters
                                </span>
                              )}
                              {checkingUsername && username.length >= 3 && (
                                <span className="text-xs text-[#00ffe7]">Verifying availability...</span>
                              )}
                              {username && username.length >= 3 && usernameAvailable === false && !checkingUsername && (
                                <span className="text-xs text-red-400">❌ Name unavailable</span>
                              )}
                              {username && username.length >= 3 && usernameAvailable === true && !checkingUsername && (
                                <span className="text-xs text-green-400">✅ Name available</span>
                              )}
                              </span>
                            </label>
                            <input
                              type="text"
                              value={username}
                              onChange={handleUsernameChange}
                              className="w-full px-3 py-2 bg-[#0f1015] border border-[#00ffe7]/30 rounded text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7] text-sm"
                              placeholder="Enter your citizen name"
                              required
                              autoFocus
                            />
                            
                          </div>

                          <div>
                            <label className="block text-[#e0e7ef] text-sm font-semibold mb-1 flex items-center justify-between">
                              <span>EMAIL</span>
                              <span>
                                {email.trim() && emailValid === false && (
                                  <span className="text-xs text-red-400">❌ Invalid email format</span>
                                )}
                                {email.trim() && emailValid === true && (
                                  <span className="text-xs text-green-400">✅ Valid email</span>
                                )}
                                {!email.trim() && (
                                  <span className="text-xs text-[#00ffe7]/50">Optional field</span>
                                )}
                              </span>
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={handleEmailChange}
                              className={`w-full px-3 py-2 bg-[#0f1015] border rounded text-[#e0e7ef] focus:outline-none focus:ring-1 text-sm transition-colors ${
                                email.trim() && emailValid === false 
                                  ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/50' 
                                  : email.trim() && emailValid === true
                                  ? 'border-green-400/50 focus:border-green-400 focus:ring-green-400/50'
                                  : 'border-[#00ffe7]/30 focus:border-[#00ffe7] focus:ring-[#00ffe7]'
                              }`}
                              placeholder="Optional email address"
                            />
                          </div>

                          <div>
                            <label className="block text-[#e0e7ef] text-sm font-semibold mb-1 flex items-center justify-between">
                              <span>REFERRAL CODE</span>
                              <span>
                              {!referral.trim() && (
                                <span className="text-xs text-[#00ffe7]/50">Optional field</span>
                              )}
                              </span>
                            </label>
                            <input
                              type="text"
                              value={referral}
                              onChange={e => setReferral(e.target.value)}
                              className="w-full px-3 py-2 bg-[#0f1015] border border-[#00ffe7]/30 rounded text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7] text-sm"
                              placeholder="Optional referral code"
                            />
                            <span className="text-xs text-[#00ffe7]">Get 1000 commission-free trades</span>
                          </div>

                          
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Submit Button */}
                <div className="space-y-4">
                  {(() => {
                    const isSubmitDisabled = username.length < 3 || usernameAvailable !== true || checkingUsername || (email.trim() !== '' && emailValid === false);
                    
                    return (
                      <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className={`w-full font-bold py-3 px-6 rounded transition-all duration-500 ${
                          isSubmitDisabled
                            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                            : "bg-[#00ffe7] text-[#181a23] hover:bg-[#ff005c] hover:text-white shadow-[0_0_8px_#00ffe7] hover:shadow-[0_0_16px_#ff005c]"
                        }`}
                      >
                        {checkingUsername ? "Verifying..." : "Complete Registration & Enter City"}
                      </button>
                    );
                  })()}

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        forceDisconnectMetaMask();
                        setShowUsernameModal(false);
                        setUsername('');
                        setEmail('');
                        setReferral('');
                      }}
                      className="text-[#e0e7ef] text-sm hover:text-[#00ffe7] transition underline"
                    >
                      Start over with different wallet
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      {statusMessage && (
        <StatusPopup
          type={statusMessage.type}
          message={statusMessage.message}
          onClose={() => setStatusMessage(null)}
        />
      )}
    </>
  );
};



export default LoginModal;
