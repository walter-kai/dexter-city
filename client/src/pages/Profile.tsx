import React, { useEffect, useRef, useState } from 'react';
import { useOAuth } from '../services/OauthProvider';  
import { useToken } from '../services/TokenProvider';
// import { useNavigate } from 'react-router-dom';
import User from '../models/User'; // Adjust the path as necessary
import { Loading } from '../components/Loading';

const Profile: React.FC = () => {
  const { authCode, initiateOAuth } = useOAuth();  
  const { privateToken } = useToken();
  const oauthCalled = useRef(false);
  const [userData, setUserData] = useState<User | null>(null); // Use User type
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  useEffect(() => {
    const processPrivateToken = async () => {
      try {
        if (!authCode && !oauthCalled.current) {
          oauthCalled.current = true;
          await initiateOAuth();  // Call initiateOAuth from OAuthProvider
        }
      } catch (error) {
        console.error("Error during private token process:", error);
      }
    };

    processPrivateToken();
  }, [authCode, initiateOAuth]);

  // Fetch user data if privateToken is available
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/me?token=${privateToken}`);
        const data: User = await response.json();

        setUserData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (privateToken) {
      console.log("Private token ready:", privateToken); // Debug log
      fetchUserData();
    }
  }, [privateToken]);

  return (
    <div className="container mx-auto">
      {privateToken ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          {userData ? (
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold">{userData.firstName} {userData.lastName}</h2>
              <p><strong>Handle:</strong> {userData.telegramHandle || 'N/A'}</p>
              <p><strong>Date Created:</strong> {new Date(userData.dateCreated).toLocaleString()}</p>
              <p><strong>Last Logged In:</strong> {new Date(userData.lastLoggedIn).toLocaleString()}</p>
              <p><strong>Mission Score:</strong> {userData.missionScore}</p>
              <p><strong>Pick Score:</strong> {userData.pickScore}</p>
              <p><strong>Total Losses:</strong> {userData.totalLosses}</p>
              <p><strong>Total Wins:</strong> {userData.totalWins}</p>
              <p><strong>Total Score:</strong> {userData.totalScore}</p>
              <p><strong>Referral:</strong> {userData.referralTelegramId || 'N/A'}</p>
              <p><strong>Favorite Sports:</strong> {userData.favoriteSports?.join(', ') || 'N/A'}</p>
              <p><strong>Telegram ID:</strong> {userData.telegramId}</p>
            </div>
          ) : (
            <p>No user data available.</p>
          )}
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default Profile;
