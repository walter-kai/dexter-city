import React, { useEffect, useState } from "react";
import { useSDK } from "@metamask/sdk-react";
import { handleUserLogin } from "../../hooks/FirestoreUser";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import '../../styles/fading.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { sdk, connected, connecting } = useSDK();
  const navigate = useNavigate();
  const { setUser, user } = useAuth();

  const [show, setShow] = useState(false);
  const [step, setStep] = useState<'connect' | 'form'>('connect');
  const [walletId, setWalletId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [referral, setReferral] = useState('');
  const [error, setError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShow(false);
      setTimeout(() => setShow(true), 10);
      setStep('connect');
      setWalletId(null);
      setUsername('');
      setReferral('');
      setError('');
    } else {
      setShow(false);
    }
  }, [isOpen]);

  const connectWallet = async () => {
    try {
      if (!sdk) {
        setError("MetaMask SDK not initialized.");
        return;
      }
      const accounts = await sdk.connect();
      if (accounts && accounts.length > 0) {
        const walletId = accounts[0];
        setWalletId(walletId);
        const { user, isNewUser } = await handleUserLogin(walletId);
        if (isNewUser || !user.username) {
          setStep('form');
          setUser(user);
        } else {
          setUser(user);
          navigate("/i/dashboard");
          onClose();
        }
      } else {
        setError("No accounts found.");
      }
    } catch (err) {
      setError("Failed to connect MetaMask.");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId || !username) {
      setError('Username is required.');
      return;
    }
    try {
      // Ensure all required fields are present for updateUser
      const userPayload = {
        ...user,
        username,
        referralId: referral,
        walletId: walletId || user?.walletId || '',
        dateCreated: user?.dateCreated || new Date(),
        lastLoggedIn: user?.lastLoggedIn || new Date(),
        telegramId: user?.telegramId || null,
        photoId: user?.photoId || null,
        photoUrl: user?.photoUrl || null,
      };
      const updatedUser = await import('../../hooks/FirestoreUser').then(m => m.updateUser(userPayload));
      setUser(updatedUser);
      navigate("/i/dashboard");
      onClose();
    } catch (err) {
      setError('Failed to update user.');
    }
  };

  // Debounced username check
  useEffect(() => {
    if (!username || (username.length < 5 && username.length > 64)) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }
    setCheckingUsername(true);
    setUsernameAvailable(null);
    if (usernameCheckTimeout) clearTimeout(usernameCheckTimeout);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/user/checkName?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        setUsernameAvailable(data.available);
      } catch (e) {
        setUsernameAvailable(false);
      } finally {
        setCheckingUsername(false);
      }
    }, 1000);
    setUsernameCheckTimeout(timeout);
    // Cleanup
    return () => clearTimeout(timeout);
  }, [username]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-[#23263a] w-full max-w-md rounded-lg p-8 relative border border-[#00ffe7]/30 shadow-[0_0_24px_#00ffe7]">
        <button
          onClick={onClose}
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
          >
            <div>
              {step === 'connect' && (
                <>
                  <h2 className="text-2xl font-bold text-center text-[#00ffe7] mb-6 drop-shadow-[0_0_8px_#00ffe7]">
                    Connect Your Wallet
                  </h2>
                  <div className="text-center mb-6">
                    <p className="text-[#e0e7ef] mb-4">
                      Connect your MetaMask wallet to accessDexter City's trading bots and features.
                    </p>
                  </div>
                  <button
                    onClick={connectWallet}
                    disabled={connecting}
                    className="w-full bg-[#00ffe7] text-[#181a23] font-bold py-3 px-6 rounded hover:bg-[#ff005c] hover:text-white shadow-[0_0_8px_#00ffe7] hover:shadow-[0_0_16px_#ff005c] transition disabled:opacity-50"
                  >
                    {connecting ? "Connecting..." : "Connect MetaMask"}
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
                      onChange={e => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-[#181a23] border border-[#00ffe7]/30 rounded-lg text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7]"
                      placeholder="Choose a username"
                      required
                    />
                    {username && username.length > 0 && username.length < 5 && (
                      <span className="text-xs text-red-500 ml-2">Username must be at least 5 characters</span>
                    )}
                    {checkingUsername && username.length >= 5 && (
                      <span className="text-xs text-[#00ffe7] ml-2">Checking availability...</span>
                    )}
                    {username && username.length >= 5 && usernameAvailable === false && !checkingUsername && (
                      <span className="text-xs text-red-500 ml-2">Username is taken</span>
                    )}
                    {username && username.length >= 5 && usernameAvailable === true && !checkingUsername && (
                      <span className="text-xs text-green-400 ml-2">Username is available</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[#e0e7ef] mb-2 font-semibold">Referral (optional)</label>
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
                    disabled={!username || username.length < 5 || checkingUsername || usernameAvailable !== true}
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
