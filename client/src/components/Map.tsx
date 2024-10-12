import React, { useRef, useEffect } from "react";
import leaflet from "leaflet";

interface MapProps {
  lat: number;
  lon: number;
  setLat: React.Dispatch<React.SetStateAction<number>>;
  setLon: React.Dispatch<React.SetStateAction<number>>;
  markers?: { lat: number; lon: number; id: string }[];
  setRadius?: React.Dispatch<React.SetStateAction<number>>;
  onMarkerClick?: (postId: string) => void; // Add this prop
}

const getRadiusInMiles = (bounds: leaflet.LatLngBounds) => {
  const ne = bounds.getNorthEast(); // LatLng of the north-east corner
  const sw = bounds.getSouthWest(); // LatLng of the south-west corner

  // Calculate the distance between the two corners
  const distanceInKm = leaflet.latLng(ne.lat, ne.lng).distanceTo(leaflet.latLng(sw.lat, sw.lng)) / 1000;
  // Convert to miles
  const distanceInMiles = distanceInKm * 0.621371;
  return distanceInMiles / 2; // Return the radius
};

const Map: React.FC<MapProps> = ({ lat, lon, setLat, setLon, markers, setRadius, onMarkerClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInitialized = useRef<leaflet.Map | null>(null);
  const updatingFromMap = useRef(false); // Ref to prevent feedback loop

  const redMarkerIcon = leaflet.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  useEffect(() => {
    if (mapRef.current && !mapInitialized.current) {
      const map = leaflet.map(mapRef.current).setView([lat, lon], 13);

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        })
        .addTo(map);

      map.on('moveend', handleMapChange);

      mapInitialized.current = map;
    } else if (mapInitialized.current) {
      if (!updatingFromMap.current) {
        mapInitialized.current.setView([lat, lon], );
      }
    }
  }, [lat, lon]);

  const handleMapChange = () => {
    if (mapInitialized.current) {
      const bounds = mapInitialized.current.getBounds();
      const radius = getRadiusInMiles(bounds);
      if (setRadius) setRadius(radius);

      const center = mapInitialized.current.getCenter();
      updatingFromMap.current = true;
      setLat(center.lat);
      setLon(center.lng);
      updatingFromMap.current = false;
    }
  };

  useEffect(() => {
    if (mapInitialized.current) {
      mapInitialized.current.eachLayer((layer) => {
        if (layer instanceof leaflet.Marker) {
          layer.remove();
        }
      });

      const markerPositions: leaflet.LatLngTuple[] = [];

      if (markers){
        markers.forEach((markerData) => {
          const lat = parseFloat(markerData.lat.toString());
          const lon = parseFloat(markerData.lon.toString());

          if (!isNaN(lat) && !isNaN(lon)) {
            const marker = leaflet
              .marker([lat, lon], { icon: redMarkerIcon })
              .addTo(mapInitialized.current!)
              .on('click', () => {
                if(onMarkerClick) onMarkerClick(markerData.id); // Call the scroll function passed from PostList
              });

            markerPositions.push([lat, lon]);
          }
        });
        
        if (mapInitialized.current) {
          // Adjust the map to fit all markers in view
          if (markerPositions.length > 0) {
            const bounds = leaflet.latLngBounds(markerPositions);
            if (bounds.isValid()) {
              mapInitialized.current.fitBounds(bounds, { padding: [20, 20] }); // Adjust the padding as needed
        
              // Optional: Zoom out a little more
              const currentZoom = mapInitialized.current.getZoom();
              mapInitialized.current.setZoom(currentZoom - 0.3); // Decrease zoom level by 1
        
              const radius = getRadiusInMiles(bounds);
              if (setRadius) setRadius(radius);
            } else {
              console.error('Invalid bounds:', bounds);
            }
          }
        }
        
      }
    }
  }, [markers, setRadius, ]);


  return <div id="map" className="w-full h-80 z-0" ref={mapRef}></div>;
};

export default Map;
