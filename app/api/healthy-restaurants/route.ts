import { NextRequest, NextResponse } from 'next/server';

// Types for Google Places API
interface GooglePlace {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    open_now: boolean;
  };
  photos?: Array<{
    photo_reference: string;
  }>;
}

export async function GET(request: Request) {
  let lat = '40.7128'; // Default NYC latitude
  let lng = '-74.0060'; // Default NYC longitude
  
  try {
    const { searchParams } = new URL(request.url);
    lat = searchParams.get('lat') || lat;
    lng = searchParams.get('lng') || lng;
    const radius = searchParams.get('radius') || '5000'; // 5km default

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    // For now, always use mock data due to Google Maps billing limitations
    console.log('Using mock data for restaurant search (Google Maps billing not enabled)');
    const mockRestaurants = generateMockRestaurants(parseFloat(lat), parseFloat(lng));
    return NextResponse.json({
      success: true,
      data: mockRestaurants,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      count: mockRestaurants.length,
      source: 'mock-demo',
      message: 'Demo data - Google Maps billing not enabled'
    });

    /* Commented out Google API code until billing is enabled
    if (!apiKey) {
      console.log('Google Maps API key not found, using mock data');
      const mockRestaurants = generateMockRestaurants(parseFloat(lat), parseFloat(lng));
      return NextResponse.json({
        success: true,
        data: mockRestaurants,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        count: mockRestaurants.length,
        source: 'mock'
      });
    }

    // Search for healthy restaurants using Google Places API
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=restaurant&keyword=healthy,organic,vegan,vegetarian,salad,fresh&key=${apiKey}`;

    console.log('Fetching from Google Places API:', placesUrl);
    
    const response = await fetch(placesUrl);
    const data = await response.json();

    console.log('Google Places API response status:', response.status);
    console.log('Google Places API response data:', JSON.stringify(data, null, 2));

    if (!response.ok || data.status === 'REQUEST_DENIED' || data.status === 'OVER_QUERY_LIMIT' || data.error_message?.includes('billing')) {
      console.error('Google Places API error (billing or quota issue):', data);
      
      // Return mock data as fallback
      const mockRestaurants = generateMockRestaurants(parseFloat(lat), parseFloat(lng));
      return NextResponse.json({
        success: true,
        data: mockRestaurants,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        count: mockRestaurants.length,
        source: 'mock-billing-fallback',
        message: 'Using sample data due to API limitations'
      });
    }

    // Transform Google Places data to our format
    const restaurants = data.results?.map((place: GooglePlace) => {
      // Calculate distance
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        place.geometry.location.lat,
        place.geometry.location.lng
      );

      // Determine health score based on types and keywords
      const healthScore = calculateHealthScore(place);

      return {
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        distance: `${distance.toFixed(1)} km`,
        rating: place.rating || 0,
        reviewCount: place.user_ratings_total || 0,
        priceLevel: place.price_level || 2,
        healthScore,
        cuisine: extractCuisineType(place.types),
        openNow: place.opening_hours?.open_now ?? true,
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        photoUrl: place.photos && place.photos.length > 0 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
          : null,
        menuHighlights: generateMenuHighlights(place),
        phone: '', // Would need Place Details API for this
        website: '' // Would need Place Details API for this
      };
    }) || [];

    // Sort by health score and distance
    restaurants.sort((a: any, b: any) => {
      if (b.healthScore !== a.healthScore) {
        return b.healthScore - a.healthScore;
      }
      return parseFloat(a.distance) - parseFloat(b.distance);
    });

    console.log(`Found ${restaurants.length} restaurants from Google Places API`);

    // If no restaurants found from API, use mock data
    if (restaurants.length === 0) {
      console.log('No restaurants from Google API, using mock data');
      const mockRestaurants = generateMockRestaurants(parseFloat(lat), parseFloat(lng));
      return NextResponse.json({
        success: true,
        data: mockRestaurants,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        count: mockRestaurants.length,
        source: 'mock'
      });
    }

    return NextResponse.json({
      success: true,
      data: restaurants.slice(0, 20), // Limit to 20 restaurants
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      count: restaurants.length,
      source: 'google'
    });
    */

  } catch (error) {
    console.error('Error fetching healthy restaurants:', error);
    
    // Return mock data as fallback
    const mockRestaurants = generateMockRestaurants(
      parseFloat(lat), 
      parseFloat(lng)
    );
    
    return NextResponse.json({
      success: true,
      data: mockRestaurants,
      location: { 
        lat: parseFloat(lat), 
        lng: parseFloat(lng) 
      },
      count: mockRestaurants.length,
      source: 'mock-fallback',
      error: 'API error, showing sample data'
    });
  }
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate health score based on place types and name
function calculateHealthScore(place: GooglePlace): number {
  let score = 50; // Base score
  const name = place.name.toLowerCase();
  const types = place.types.map(t => t.toLowerCase());

  // Positive indicators
  if (name.includes('organic')) score += 20;
  if (name.includes('vegan')) score += 15;
  if (name.includes('vegetarian')) score += 10;
  if (name.includes('salad')) score += 15;
  if (name.includes('juice') || name.includes('smoothie')) score += 10;
  if (name.includes('fresh')) score += 10;
  if (name.includes('bowl')) score += 8;
  if (types.includes('health_food')) score += 20;

  // Restaurant rating bonus
  if (place.rating) {
    score += (place.rating - 3) * 5; // Bonus for ratings above 3
  }

  // Negative indicators
  if (name.includes('fast food') || types.includes('fast_food')) score -= 20;
  if (name.includes('pizza') && !name.includes('organic')) score -= 10;
  if (name.includes('burger') && !name.includes('veggie')) score -= 15;

  return Math.max(0, Math.min(100, score)); // Clamp between 0-100
}

// Extract cuisine type from Google Places types
function extractCuisineType(types: string[]): string {
  const cuisineMap: { [key: string]: string } = {
    'vegetarian_restaurant': 'Vegetarian',
    'vegan_restaurant': 'Vegan',
    'health_food': 'Health Food',
    'american_restaurant': 'American',
    'asian_restaurant': 'Asian',
    'mediterranean_restaurant': 'Mediterranean',
    'mexican_restaurant': 'Mexican',
    'italian_restaurant': 'Italian',
    'chinese_restaurant': 'Chinese',
    'japanese_restaurant': 'Japanese',
    'thai_restaurant': 'Thai',
    'indian_restaurant': 'Indian',
    'cafe': 'Cafe',
    'meal_takeaway': 'Takeaway'
  };

  for (const type of types) {
    if (cuisineMap[type]) {
      return cuisineMap[type];
    }
  }

  return 'Healthy'; // Default
}

// Helper function to generate menu highlights based on place data
function generateMenuHighlights(place: GooglePlace): string[] {
  const name = place.name.toLowerCase();
  const highlights: string[] = [];

  if (name.includes('salad')) highlights.push('Fresh Salads');
  if (name.includes('juice') || name.includes('smoothie')) highlights.push('Fresh Juices & Smoothies');
  if (name.includes('bowl')) highlights.push('Healthy Bowls');
  if (name.includes('vegan')) highlights.push('Vegan Options');
  if (name.includes('organic')) highlights.push('Organic Ingredients');
  if (name.includes('wrap')) highlights.push('Healthy Wraps');

  // Add some generic healthy options if none found
  if (highlights.length === 0) {
    highlights.push('Healthy Options', 'Fresh Ingredients');
  }

  return highlights.slice(0, 3); // Limit to 3 highlights
}

// Generate mock restaurants as fallback
function generateMockRestaurants(lat: number, lng: number) {
  const mockData = [
    {
      id: 'mock-1',
      name: 'Green Garden Cafe',
      address: '123 Health St',
      distance: '0.5 km',
      rating: 4.5,
      reviewCount: 127,
      priceLevel: 2,
      healthScore: 95,
      cuisine: 'Vegetarian',
      openNow: true,
      coordinates: { lat: lat + 0.001, lng: lng + 0.001 },
      photoUrl: null,
      menuHighlights: ['Fresh Salads', 'Organic Smoothies', 'Quinoa Bowls'],
      phone: '(555) 123-4567',
      website: 'www.greengarden.com'
    },
    {
      id: 'mock-2',
      name: 'Fresh & Fit',
      address: '456 Wellness Ave',
      distance: '0.8 km',
      rating: 4.3,
      reviewCount: 89,
      priceLevel: 2,
      healthScore: 88,
      cuisine: 'Health Food',
      openNow: true,
      coordinates: { lat: lat + 0.002, lng: lng - 0.001 },
      photoUrl: null,
      menuHighlights: ['Protein Bowls', 'Cold-Pressed Juices', 'Acai Bowls'],
      phone: '(555) 234-5678',
      website: 'www.freshfit.com'
    },
    {
      id: 'mock-3',
      name: 'Organic Oasis',
      address: '789 Natural Way',
      distance: '1.2 km',
      rating: 4.7,
      reviewCount: 203,
      priceLevel: 3,
      healthScore: 92,
      cuisine: 'Organic',
      openNow: false,
      coordinates: { lat: lat - 0.001, lng: lng + 0.002 },
      photoUrl: null,
      menuHighlights: ['Farm-to-Table', 'Gluten-Free Options', 'Vegan Desserts'],
      phone: '(555) 345-6789',
      website: 'www.organicopasis.com'
    }
  ];

  return mockData;
}