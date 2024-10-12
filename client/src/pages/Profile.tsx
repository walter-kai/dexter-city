import React, { useEffect, useRef, useState } from 'react';
import { useOAuth } from '../services/OauthProvider';  
import { useToken } from '../services/TokenProvider';
// import { useNavigate } from 'react-router-dom';
import { User } from '../types/User'; // Adjust the path as necessary
import { Hootsuite } from '../services/Hootsuite';
// import { FaUser } from 'react-icons/fa';
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
        const data = await response.json();

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
          <button 
            className="btn-standard" 
            type="button" 
            onClick={() => Hootsuite.getUser()} // Navigate to Search
          >
            Hootsuite User Info
          </button>
          {userData ? (
            <div className="bg-white shadow-md rounded-lg p-4">
              <img src={userData.profile_picture} alt={`${userData.first_name} ${userData.last_name}`} className="w-24 h-24 rounded-full mb-4" />
              <h2 className="text-xl font-semibold">{userData.first_name} {userData.last_name}</h2>
              <p><strong>Status:</strong> {userData.status}</p>
              <p><strong>Account Creation Date:</strong> {new Date(userData.account_creation_date).toLocaleString()}</p>
              <p><strong>Verified:</strong> {userData.verified ? 'Yes' : 'No'}</p>
              <p><strong>Neighborhood:</strong> <a href={userData.neighborhood_url} target="_blank" rel="noopener noreferrer">{userData.neighborhood_name}</a></p>
              <p><strong>City:</strong> {userData.city_name}</p>
              {userData.is_business_profile && <p><strong>Business Name:</strong> {userData.business_name}</p>}
              {userData.is_agency_profile && (
                <div>
                  <p><strong>Agency Name:</strong> {userData.agency_name}</p>
                  <p><strong>Agency URL:</strong> <a href={userData.agency_url_at_nextdoor} target="_blank" rel="noopener noreferrer">{userData.agency_url_at_nextdoor}</a></p>
                </div>
              )}
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
