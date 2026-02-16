const axios = require('axios');

class LocationService {
  constructor() {
    this.geocodingUrl = 'https://nominatim.openstreetmap.org/search';
    this.reverseGeocodingUrl = 'https://nominatim.openstreetmap.org/reverse';
  }

  async geocodeAddress(address) {
    try {
      const response = await axios.get(this.geocodingUrl, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'SoulSync/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const addressDetails = result.address;

        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          formattedAddress: result.display_name,
          placeId: result.place_id,
          address: {
            street: addressDetails.road || addressDetails.street || '',
            city: addressDetails.city || addressDetails.town || addressDetails.village || '',
            state: addressDetails.state || '',
            zipCode: addressDetails.postcode || '',
            country: addressDetails.country || ''
          },
          neighborhood: addressDetails.suburb || addressDetails.neighbourhood || '',
          locality: addressDetails.locality || ''
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  isWithinDistance(user1Location, user2Location, maxDistance = 5) {
    if (!user1Location?.coordinates || !user2Location?.coordinates) {
      return false;
    }
    
    const [lng1, lat1] = user1Location.coordinates;
    const [lng2, lat2] = user2Location.coordinates;
    
    const distance = this.calculateDistance(lat1, lng1, lat2, lng2);
    return distance <= maxDistance;
  }

  calculateLocationMatchScore(user1, user2) {
    let score = 0;
    
    if (user1.location?.coordinates && user2.location?.coordinates) {
      const [lng1, lat1] = user1.location.coordinates;
      const [lng2, lat2] = user2.location.coordinates;
      const distance = this.calculateDistance(lat1, lng1, lat2, lng2);
      
      if (distance <= 1) score += 60;
      else if (distance <= 3) score += 50;
      else if (distance <= 5) score += 40;
      else if (distance <= 10) score += 25;
      else if (distance <= 20) score += 10;
    }
    
    if (user1.location?.address?.neighborhood && user2.location?.address?.neighborhood) {
      if (user1.location.address.neighborhood.toLowerCase() === 
          user2.location.address.neighborhood.toLowerCase()) {
        score += 20;
      }
    }
    
    if (user1.favoritePlaces?.length > 0 && user2.favoritePlaces?.length > 0) {
      const user1Places = user1.favoritePlaces.map(p => p.name.toLowerCase());
      const user2Places = user2.favoritePlaces.map(p => p.name.toLowerCase());
      
      const sharedPlaces = user1Places.filter(place => user2Places.includes(place));
      score += Math.min(sharedPlaces.length * 5, 20);
    }
    
    return score;
  }

  getNearbyQuery(coordinates, radiusKm = 5) {
    return {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: radiusKm * 1000
        }
      }
    };
  }

  formatDistance(distanceKm) {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  }

  findNearbyCommonPlaces(user1Places, user2Places, centerLocation, maxDistance = 5) {
    if (!user1Places || !user2Places || !centerLocation) return [];
    
    const commonPlaces = [];
    const user1PlaceNames = user1Places.map(p => p.name.toLowerCase());
    const sharedPlaces = user2Places.filter(p => 
      user1PlaceNames.includes(p.name.toLowerCase())
    );
    
    sharedPlaces.forEach(place => {
      if (place.coordinates) {
        const [lng, lat] = place.coordinates;
        const distance = this.calculateDistance(
          centerLocation.lat, centerLocation.lng,
          lat, lng
        );
        
        if (distance <= maxDistance) {
          commonPlaces.push({
            ...place,
            distance: this.formatDistance(distance)
          });
        }
      }
    });
    
    return commonPlaces.sort((a, b) => 
      parseFloat(a.distance) - parseFloat(b.distance)
    );
  }
}

module.exports = new LocationService();
