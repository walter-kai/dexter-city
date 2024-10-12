import React, { useState, useEffect } from 'react';
import Map from '../components/Map'; // Import the Map component
import PostList from '../components/PostList';
import { useToken } from '../services/TokenProvider';
import { cities } from '../components/Cities'; // Import cities
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Import Font Awesome icons
import { useOAuth } from '../services/OauthProvider';
import { Loading } from '../components/Loading';

const Share: React.FC = () => {
  const [lat, setLat] = useState<number>(47.623297);
  const [lon, setLon] = useState<number>(-122.318344);
  const [bodyText, setBodyText] = useState<string>("");
  const [hashtag, setHashtag] = useState<string>("");
  const [mediaAttachments, setMediaAttachments] = useState<File[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { privateToken, fetchPublicToken } = useToken();
  
  // State for search form visibility
  const { authCode, initiateOAuth } = useOAuth();  

  useEffect(() => {
    if (!authCode) {
      initiateOAuth();
    }
  }, [authCode, initiateOAuth]);

  useEffect(() => {
    const city = cities[selectedState]?.find(c => c.name === selectedCity);
    if (city) {
      setLat(city.lat);
      setLon(city.lon);
    }
  }, [selectedCity, selectedState]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedCity(""); // Reset city when state changes
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLon(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const publicToken = await fetchPublicToken();
      if (!publicToken) {
        throw new Error("No token available. Please authenticate.");
      }
      
      const formData = new FormData();
      formData.append("body_text", bodyText);
      formData.append("hashtag", hashtag);
      if (mediaAttachments) {
        mediaAttachments.forEach((file) => {
          formData.append("media_attachments", file);
        });
      }
      formData.append("lat", lat.toString());
      formData.append("lon", lon.toString());

      const response = await fetch(`/api/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicToken}`,
        },
        body: formData,
      });
      const data = await response.json();
      setLoading(false);

      if (data.error) {
        console.error("API Error:", data.error);
        alert(`Error: ${data.error}. Check console for details.`);
      } else {
        // Handle successful post sharing (e.g., show success message)
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("An error occurred while sharing the post. Check console for details.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setMediaAttachments(Array.from(event.target.files));
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      setMediaAttachments(Array.from(event.dataTransfer.files));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const states = Object.keys(cities); // Get the states dynamically from cities

  return (
    <>
      {!privateToken ? ( // Show loading state
        <Loading />
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <textarea
                  placeholder="Share your message..."
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full input-standard"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Hashtag (optional)"
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value)}
                  className="w-full input-standard"
                />
              </div>
              <div 
                className="border-dashed border-2 border-gray-300 p-4 text-center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <p>Drag and drop files here or</p>
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange} 
                  className="hidden" 
                  id="file-input"
                />
                <label htmlFor="file-input" className="btn-light cursor-pointer">Choose files</label>
              </div>
              <div className="flex space-x-4">
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  className="w-1/2 input-standard text-sm"
                >
                  <option value="">Select a state</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedCity}
                  onChange={handleCityChange}
                  disabled={!selectedState}
                  className="w-1/2 input-standard text-sm"
                >
                  <option value="">Select a city</option>
                  {selectedState && cities[selectedState].map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-gray-200">
                <Map lat={lat} lon={lon} setLat={setLat} setLon={setLon} />
              </div>
              <button type="submit" className="btn-standard w-full ">
                Share
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Share;
