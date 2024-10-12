import React, { useState, useEffect } from 'react';
import { useToken } from '../services/TokenProvider';
import PostList, { Post } from '../components/PostList';
import { City } from '../types/City';

const Trending: React.FC = () => {
  const { publicToken, fetchPublicToken } = useToken();
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>([]); // State to hold unique regions
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  
  // Effect to filter cities based on selected region
  useEffect(() => {
    const filtered = selectedRegion 
      ? cities.filter(city => city.state === selectedRegion) 
      : [];
    setFilteredCities(filtered);
  }, [selectedRegion, cities]);

  // Effect to fetch trending posts based on selected city
  useEffect(() => {
    const fetchTrendingPosts = async () => {
      if (selectedCity) {
        setLoading(true);
        try {
          const response = await fetch(`/api/trending/${selectedCity}?page=${page}&token=${publicToken}`);
          const data = await response.json();
          setPosts(data.posts);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching trending posts:', error);
          setLoading(false);
        }
      }
    };

    fetchTrendingPosts();
  }, [selectedCity, page, publicToken]);

  const fetchCities = async (country: string) => {
    try {
      if (!publicToken) await fetchPublicToken();
      const response = await fetch(`/api/cities?token=${publicToken}&country=${country}`);
      const data = await response.json();

      // Sort cities by country, then state, then city in descending alphabetical order
      const sortedCities = data.sort((a: City, b: City) => {
        const countryCompare = b.country.localeCompare(a.country); 
        if (countryCompare !== 0) return countryCompare;

        const stateCompare = b.state.localeCompare(a.state);
        if (stateCompare !== 0) return stateCompare;

        return b.city.localeCompare(a.city); 
      });

      setCities(sortedCities);

    // Extract unique regions (states) after fetching cities
    const uniqueRegions = Array.from(new Set(sortedCities
      .map((city: { state: string }) => city.state)
      .filter((state: string) => state !== undefined && state !== null) // Filter out undefined/null states
    ));
    setRegions(uniqueRegions as string[]);

      
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleCountryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const country = event.target.value;
    setSelectedCountry(country);
    setSelectedRegion(null); // Reset selected region when country changes
    setSelectedCity(null); // Reset selected city when country changes
    setPage(0); // Reset page on country change

    if (country) {
      setSelectedCountry(null);
      await fetchCities(country); // Fetch cities for the selected country
      setSelectedCountry(country);
    }
  };

  const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(event.target.value);
    setSelectedCity(null); // Reset selected city when region changes
    setPage(0); // Reset page on region change
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
    setPage(0); // Reset page on city change
  };

  const handleNextPage = () => {
    setPage(prevPage => prevPage + 1);
  };

  // Define available countries
  const countries = [
    { code: 'ca', name: 'Canada' },
    { code: 'us', name: 'United States' },
    { code: 'au', name: 'Australia' },
    { code: 'uk', name: 'United Kingdom' },
  ];

  return (
    <div className="p-5 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Trending Posts</h1>
      
      {/* Dropdown for selecting country */}
      <select value={selectedCountry || ''} onChange={handleCountryChange} className="mb-4 p-1 border rounded">
        <option value="" disabled>Select a country</option>
        {countries.map(country => (
          <option key={country.code} value={country.code}>{country.name}</option>
        ))}
      </select>

      {/* Dropdown for selecting region */}
      <select value={selectedRegion || ''} onChange={handleRegionChange} className="mb-4 p-1 border rounded" disabled={!selectedCountry}>
        <option value="" disabled>Select a region</option>
        {regions.map(region => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>

      {/* Dropdown for selecting city */}
      <select value={selectedCity || ''} onChange={handleCityChange} className="mb-4 p-1 border rounded" disabled={!selectedRegion}>
        <option value="" disabled>Select a city</option>
        {filteredCities.map(city => (
          <option key={city.id} value={city.id}>{city.city}</option>
        ))}
      </select>

      <PostList posts={posts} loading={loading} />
      {posts?.length > 0 && (
        <button
          onClick={handleNextPage}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default Trending;
