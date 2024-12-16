import React, { useEffect, useState } from 'react';
import User from '../models/User'; // Adjust the path as necessary
import LoadingScreenDots from '../components/LoadingScreenDots';

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<User | null>(null); // Use User type
  const [loading, setLoading] = useState(true); // Start with loading as true

  useEffect(() => {
    // Simulate loading delay (could be replaced with actual data fetching)
    setLoading(true);
    
    try {
      const storedUserData = sessionStorage.getItem('currentUser');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData)); // Load user data from sessionStorage
      } else {
        console.log("No user data found in sessionStorage.");
      }
    } catch (err) {
      console.error('Error retrieving user data from sessionStorage: ', err);
    } finally {
      setLoading(false); // Stop loading once done
    }
  }, []); // Empty dependency array means this runs once on component mount

  if (loading) {
    return <LoadingScreenDots />; // Show loading animation
  }

  return (
    <div className="container mx-auto">
      <div>
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        {userData ? (
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl flex font-semibold">{userData.username}
              <div className="text-base">@{userData.telegramId || 'N/A'}</div>
            </h2>
           
            <p><strong>Date Created:</strong> {new Date(userData.dateCreated).toLocaleString()}</p>
            <p><strong>Last Logged In:</strong> {new Date(userData.lastLoggedIn).toLocaleString()}</p>
            <p><strong>Referral:</strong> {userData.referralId || 'N/A'}</p>
            <p><strong>Telegram ID:</strong> {userData.telegramId}</p>
          </div>
        ) : (
          <p>No user data available.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
