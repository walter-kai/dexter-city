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
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [referral, setReferral] = useState('');
  const [statusMessage, setStatusMessage] = useState<{type: 'loading' | 'success' | 'error', message: string} | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [citizenshipFormFilled, setCitizenshipFormFilled] = useState(false);
  const [profilePictureId, setProfilePictureId] = useState<number>(Math.floor(Math.random() * 10000));
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShow(false);
      setTimeout(() => setShow(true), 10);
      setShowRegistrationForm(false);
      setWalletId(null);
      setUsername('');
      setReferral('');
      setStatusMessage(null);
      setIsConnecting(false);
      setCitizenshipFormFilled(false);
      setProfilePictureId(Math.floor(Math.random() * 10000));
    } else {
      setShow(false);
      setStatusMessage(null);
      setIsConnecting(false);
      setShowRegistrationForm(false);
      setCitizenshipFormFilled(false);
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
    // Check if citizenship form is filled before allowing connection
    if (!citizenshipFormFilled || !username || username.length < 3 || usernameAvailable !== true) {
      setStatusMessage({ 
        type: 'error', 
        message: 'Please complete the citizenship registration form first' 
      });
      return;
    }

    try {
      setStatusMessage(null);
      setIsConnecting(true);
      
      const authenticatedUser = await connectMetaMask() as User | null;
      
      if (authenticatedUser) {
        // Update context state
        setUser(authenticatedUser);
        
        if (!authenticatedUser.username) {
          // New user - update with citizenship form data
          try {
            const updatedUser = await userApi.updateUser({
              username: username.trim(),
              ...(referral.trim() && { referralId: referral.trim() }),
            });
            setUser(updatedUser);
            closeLoginModal();
            navigate("/i/dashboard");
            onClose();
          } catch (updateErr: any) {
            console.error('Error updating user:', updateErr);
            setStatusMessage({ type: 'error', message: updateErr?.message || 'Failed to update user profile' });
          }
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId || !username) {
      setStatusMessage({ type: 'error', message: 'Wallet ID and username are required' });
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

  // Check if citizenship form is complete
  useEffect(() => {
    const isComplete = username.length >= 3 && usernameAvailable === true && !checkingUsername;
    setCitizenshipFormFilled(isComplete);
  }, [username, usernameAvailable, checkingUsername]);

  const regenerateProfilePicture = () => {
    setProfilePictureId(Math.floor(Math.random() * 10000));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[30] transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-[#23263a] w-full max-w-lg rounded-lg p-8 relative border border-[#00ffe7]/30 shadow-[0_0_24px_#00ffe7]">
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
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-[#00ffe7] mb-6 drop-shadow-[0_0_8px_#00ffe7]">
              Dexter City Homeland Security
            </h2>

            {/* Citizenship Registration Form */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-center text-[#e0e7ef] border-b border-[#00ffe7]/30 pb-2">
                Citizenship
              </h3>
              
              {/* Driver's License/Passport Style Card */}
              <div className="bg-gradient-to-r from-[#181a23] to-[#23263a] border border-[#00ffe7]/50 rounded-lg p-6 shadow-[0_0_16px_#00ffe7/20]">
                <div className="flex items-start space-x-4">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={`https://robohash.org/dextercity-${username}?set=set1&size=300x400`}
                        alt={`Citizen ${profilePictureId}`}
                        className="w-30 h-40 rounded-lg border-2 border-[#00ffe7] shadow-lg bg-[#181a23] transition-all duration-500"
                      />

                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-[#e0e7ef] text-sm font-semibold mb-1">CITIZEN NAME</label>
                      <input
                        type="text"
                        value={username}
                        onChange={handleUsernameChange}
                        className="w-full px-3 py-2 bg-[#0f1015] border border-[#00ffe7]/30 rounded text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7] text-sm"
                        placeholder="Enter your citizen name"
                        required
                      />
                      {username.length < 3 && (
                        <span className="text-xs text-orange-400">
                          Minimum 3 characters required
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
                    </div>

                    <div>
                      <label className="block text-[#e0e7ef] text-sm font-semibold mb-1">REFERRAL CODE</label>
                      <input
                        type="text"
                        value={referral}
                        onChange={e => setReferral(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0f1015] border border-[#00ffe7]/30 rounded text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7] text-sm"
                        placeholder="Optional referral code"
                      />
                      <span className="text-xs text-[#00ffe7]">Get 1000 commission-free trades</span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-[#e0e7ef]">
                        <div>CITIZENSHIP STATUS:</div>
                        <div className={`font-bold ${citizenshipFormFilled ? 'text-green-400' : 'text-orange-400'}`}>
                          {citizenshipFormFilled ? '✅ APPROVED' : '⏳ PENDING'}
                        </div>
                      </div>
                      <div className="text-xs text-[#e0e7ef] text-right">
                        <div>ISSUED BY:</div>
                        <div className="font-bold text-[#00ffe7]">DEXTER CITY</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connect MetaMask Button */}
              <div className="space-y-4">
                <button
                  onClick={connectWallet}
                  disabled={isConnecting || !citizenshipFormFilled}
                  className={`w-full font-bold py-3 px-6 rounded transition-all duration-500 ${
                    !citizenshipFormFilled
                      ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                      : isConnecting 
                        ? "bg-orange-500 text-white shadow-[0_0_8px_orange] hover:shadow-[0_0_16px_orange]"
                        : "bg-[#00ffe7] text-[#181a23] hover:bg-[#ff005c] hover:text-white shadow-[0_0_8px_#00ffe7] hover:shadow-[0_0_16px_#ff005c]"
                  } disabled:opacity-50`}
                >
                  {!citizenshipFormFilled 
                    ? "Complete Citizenship Form First"
                    : isConnecting 
                      ? "Connecting..." 
                      : "Connect MetaMask & Enter City"
                  }
                </button>

                {/* {!citizenshipFormFilled && (
                  <div className="text-center text-xs text-orange-400">
                    ⚠️ Complete the citizenship registration above to proceed
                  </div>
                )} */}

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
