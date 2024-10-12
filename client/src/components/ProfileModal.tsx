import React from 'react';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  status: string;
  account_creation_date: string;
  verified: string;
  is_agency_profile: string;
  is_business_profile: string;
  is_neighbor_profile: string;
  neighborhood_name: string;
  neighborhood_url: string;
  city_name: string;
  business_name: string;
  agency_id: string;
  agency_name: string;
  agency_url_at_nextdoor: string;
  agency_external_url: string;
  agency_photo: string;
  agency_city: string;
  agency_state: string;
}

interface ProfileModalProps {
  profile: Profile | null;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ profile, onClose }) => {
  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded-lg shadow-lg w-[500px]">
        <button className="float-right text-xl" onClick={onClose}>
          ✖️
        </button>
        <div className="text-center">
          <img
            src={profile.profile_picture}
            alt={`${profile.first_name} ${profile.last_name}`}
            className="w-24 h-24 rounded-full mx-auto"
          />
          <h2 className="text-xl font-bold mt-2">{profile.first_name} {profile.last_name}</h2>
          <p className="text-gray-600">{profile.status}</p>
        </div>
        <div className="mt-4">
          <p><strong>Neighborhood:</strong> <a href={profile.neighborhood_url} className="text-blue-500">{profile.neighborhood_name}</a></p>
          <p><strong>City:</strong> {profile.city_name}</p>
          <p><strong>Account Created:</strong> {profile.account_creation_date}</p>
          <p><strong>Verified:</strong> {profile.verified}</p>

          {/* Agency Information */}
          {profile.is_agency_profile && (
            <div className="mt-4">
              <h3 className="font-bold text-lg">Agency Information</h3>
              <img src={profile.agency_photo} alt={profile.agency_name} className="w-20 h-20 rounded-md" />
              <p><strong>Agency Name:</strong> <a href={profile.agency_url_at_nextdoor} className="text-blue-500">{profile.agency_name}</a></p>
              <p><strong>Agency City:</strong> {profile.agency_city}, {profile.agency_state}</p>
              <p><strong>Agency External URL:</strong> <a href={profile.agency_external_url} className="text-blue-500">{profile.agency_external_url}</a></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
