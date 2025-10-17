'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Star, Clock, Phone, Globe, Navigation } from 'lucide-react';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
    googleMapsLoading?: boolean;
  }
}

// Add metadata for better SSR
export const dynamic = 'force-dynamic';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  reviewCount: number;
  priceLevel: number;
  healthScore: number;
  cuisine: string;
  openNow: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  photoUrl?: string;
  menuHighlights: string[];
  phone?: string;
  website?: string;
}

export default function HealthyRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string>('');
  const [map, setMap] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!mounted) return;
    if (typeof window !== 'undefined') {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      // Check if script is already being loaded
      if (window.googleMapsLoading) {
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => setMapLoaded(true));
        return;
      }

      // Set loading flag to prevent multiple loads
      window.googleMapsLoading = true;

      // Load the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.googleMapsLoading = false;
        setMapLoaded(true);
      };
      script.onerror = () => {
        window.googleMapsLoading = false;
        setError('Failed to load Google Maps');
      };
      document.head.appendChild(script);
    }
  }, [mounted]);

  // Get user location
  useEffect(() => {
    if (!mounted) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          fetchRestaurants(location.lat, location.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Please enable location access to find nearby healthy restaurants');
          // Fallback to a default location (e.g., city center)
          const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // NYC
          setUserLocation(defaultLocation);
          fetchRestaurants(defaultLocation.lat, defaultLocation.lng);
        }
      );
    }
  }, [mounted]);

  // Initialize map when both location and Google Maps are ready
  useEffect(() => {
    if (mounted && mapLoaded && userLocation && typeof window !== 'undefined') {
      initializeMap();
    }
  }, [mapLoaded, userLocation, mounted]);

  const fetchRestaurants = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/healthy-restaurants?lat=${lat}&lng=${lng}&radius=5000`);
      const data = await response.json();
      
      if (data.success) {
        setRestaurants(data.data);
        
        // Show informative message if using mock data
        if (data.source && data.source.includes('mock')) {
          setError(''); // Clear any previous errors
          console.log('Using sample restaurant data for demonstration');
        }
      } else {
        setError('Failed to fetch restaurants');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!userLocation || !mapLoaded) return;

    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    try {
      const googleMap = new window.google.maps.Map(mapElement, {
        center: userLocation,
        zoom: 13,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add user location marker
      new window.google.maps.Marker({
        position: userLocation,
        map: googleMap,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#3B82F6"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24)
        }
      });

    setMap(googleMap);
    } catch (error) {
      console.error('Google Maps initialization error:', error);
      setError('Google Maps is currently unavailable. Showing restaurant list only.');
      setMapLoaded(false);
    }
  };

  // Add restaurant markers when restaurants data changes
  useEffect(() => {
    if (mounted && map && restaurants.length > 0) {
      restaurants.forEach((restaurant) => {
        const marker = new window.google.maps.Marker({
          position: restaurant.coordinates,
          map: map,
          title: restaurant.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#10B981"/>
                <circle cx="12" cy="9" r="3" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${restaurant.name}</h3>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${restaurant.address}</p>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
                <span>⭐ ${restaurant.rating.toFixed(1)}</span>
                <span>🏃 ${restaurant.distance}</span>
                <span style="background: #10B981; color: white; padding: 2px 6px; border-radius: 12px;">
                  ${restaurant.healthScore}% Healthy
                </span>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });
    }
  }, [mounted, map, restaurants]);

  const getPriceDisplay = (level: number) => {
    return '$'.repeat(level) + '$'.repeat(4 - level).replace(/\$/g, '·');
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Prevent hydration issues by showing loading until mounted */}
        {!mounted ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Healthy Restaurants Near You
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover healthy dining options in your area with our curated selection of restaurants
            focused on fresh, nutritious, and delicious meals.
          </p>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Map View
              </h2>
            </div>
            {mounted && mapLoaded && !error.includes('Google Maps') ? (
              <div id="map" className="w-full h-96" suppressHydrationWarning></div>
            ) : (
              <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Map Unavailable</h3>
                  <p className="text-gray-600 mb-4">
                    Interactive map is currently unavailable. Please check the restaurant list below.
                  </p>
                  <div className="text-sm text-gray-500">
                    Showing sample restaurants for demonstration
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Restaurant List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {loading ? 'Finding restaurants...' : `${restaurants.length} Restaurants Found`}
              </h2>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Finding healthy restaurants near you...</p>
                </div>
              ) : restaurants.length > 0 ? (
                <div className="space-y-4 p-4">
                  {restaurants.map((restaurant) => (
                    <div key={restaurant.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthScoreColor(restaurant.healthScore)}`}>
                          {restaurant.healthScore}% Healthy
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{restaurant.address}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{restaurant.rating.toFixed(1)} ({restaurant.reviewCount})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Navigation className="w-4 h-4" />
                          <span>{restaurant.distance}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className={`w-4 h-4 ${restaurant.openNow ? 'text-green-500' : 'text-red-500'}`} />
                          <span>{restaurant.openNow ? 'Open' : 'Closed'}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {restaurant.menuHighlights.map((highlight, index) => (
                          <span key={index} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md">
                            {highlight}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {restaurant.cuisine} • {getPriceDisplay(restaurant.priceLevel)}
                        </span>
                        <button
                          onClick={() => {
                            if (map) {
                              map.setCenter(restaurant.coordinates);
                              map.setZoom(16);
                            }
                          }}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                        >
                          View on Map
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No healthy restaurants found in your area.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}