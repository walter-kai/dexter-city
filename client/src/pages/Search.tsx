import React, { useState, useEffect } from 'react';
import Map from '../components/Map'; // Import the Map component
import PostList, { Post } from '../components/PostList';
import { useToken } from '../services/TokenProvider';
import { cities } from '../components/Cities'; // Import cities
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Import Font Awesome icons
import { useOAuth } from '../services/OauthProvider';

const Search: React.FC = () => {
  const [lat, setLat] = useState<number>(47.623297);
  const [lon, setLon] = useState<number>(-122.318344);
  const [radius, setRadius] = useState<number>(5);
  const [query, setQuery] = useState<string>("stolen");
  const [markers, setMarkers] = useState<{ lat: number; lon: number; id: string }[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);
  const { publicToken, fetchPublicToken } = useToken();
  const [loading, setLoading] = useState(false);
  
  // State for search form visibility
  const [isFormVisible, setIsFormVisible] = useState<boolean>(true);



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
    const city = e.target.value;
    setSelectedCity(city);
  
    const selectedCityData = cities[selectedState]?.find(c => c.name === city);
    if (selectedCityData) {
      setLat(selectedCityData.lat);
      setLon(selectedCityData.lon);
    }
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
  
      const response = await fetch(`/api/search?query=${query}&lat=${lat}&lon=${lon}&radius=${radius}&token=${publicToken}`);
      const data = await response.json();
      setLoading(false);
  
      if (data.error) {
        console.error("API Error:", data.error);
        alert(`Error: ${data.error}. Check console for details.`);
      } else {
        const sortedPosts = (data.posts || []).sort(
          (a: Post, b: Post) => b.creation_date_epoch_seconds - a.creation_date_epoch_seconds
        );
  
        setPosts(sortedPosts);
        const newMarkers = data.posts.map((post: Post) => ({
          lat: post.latitude,
          lon: post.longitude,
          id: "post-" + post.id
        }));
        setMarkers(newMarkers);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("An error occurred while fetching data. Check console for details.");
    }
  };
  

  const scrollToPost = (id: string) => {
    const postElement = document.getElementById(id);
    if (postElement) {
      // Scroll into view
      postElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
      // Adjust for any fixed header (optional)
      const headerOffset = 48; // Change this value to the height of your header
      const elementPosition = postElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
  
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  

  const states = Object.keys(cities); // Get the states dynamically from cities

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Search for..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full input-standard"
              required
            />
          </div>
          {/* {isFormVisible && ( */}
            <div className={`transition-all space-y-2 duration-800 ease-in-out overflow-hidden ${isFormVisible ? 'max-h-screen' : 'max-h-0'}`}            >
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
              <div className="flex space-x-4">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={lat.toFixed(6)}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-1/2 input-standard text-xs"
                  required
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={lon.toFixed(6)}
                  onChange={(e) => setLon(parseFloat(e.target.value))}
                  className="w-1/2 input-standard text-xs"
                  required
                />
                <button type="button" onClick={handleGetLocation} className="btn-teal text-sm px-4 w-[200px]">
                  Locate Me
                </button>
              </div>
              <div className="bg-gray-200">
              <Map lat={lat} lon={lon} setLat={setLat} setLon={setLon} markers={markers} setRadius={setRadius} onMarkerClick={scrollToPost}/>
            </div>
            </div>
          {/* )} */}
          <button type="submit" className="btn-standard w-full ">
            Search
          </button>
        </form>
      </div>

      {/* Toggle Button */}
      <div className="flex justify-center">
        <button 
          className="btn-light text-black flex justify-center p-2 w-32 rounded-full" 
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          {isFormVisible ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      <PostList posts={posts} loading={loading} />
    </div>
  );
};

export default Search;
