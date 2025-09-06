import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme, Text } from 'react-native-paper';
import { GOOGLE_MAPS_API_KEY } from '@env';

const MapScreen = () => {
  const { colors } = useTheme();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const mapRef = useRef(null); // A reference to the map component itself
  const initialLocationFetched = useRef(false); // A flag to ensure we only fetch places once

  // This effect runs only once to request location permission
  useEffect(() => {
    const checkPermission = async () => {
      if (!GOOGLE_MAPS_API_KEY) {
        setErrorMsg('API Key is missing. Please check your .env file.');
        setLoading(false);
        return;
      }
      const granted = await requestLocationPermission();
      setPermissionGranted(granted);
      // If permission is granted, the loading will be handled by the map itself
      if (!granted) {
        setLoading(false); 
      }
    };
    checkPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'JeevRak Location Permission',
            message: 'JeevRak needs your location to show the map and find nearby services.',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          setErrorMsg('Location permission was denied.');
          return false;
        }
      } catch (err) {
        console.warn(err);
        setErrorMsg('An error occurred while requesting permission.');
        return false;
      }
    }
    return true;
  };

  const fetchNearbyPlaces = async (lat, lon) => {
    const searchRadius = 5000; // 5 kilometers
    const placeTypes = ['pharmacy', 'veterinary_care'];
    let allPlaces = [];

    try {
      for (const type of placeTypes) {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${searchRadius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const json = await response.json();
        
        if (json.status === "OK") {
            allPlaces = [...allPlaces, ...json.results];
        } else {
            console.error(`Places API Error for type ${type}:`, json.status, json.error_message);
            setErrorMsg(`Could not fetch places: ${json.status}. Please check your API key and ensure the Places API is enabled.`);
        }
      }
      setPlaces(allPlaces);
    } catch (error) {
      console.error("Failed to fetch places:", error);
      setErrorMsg('Could not fetch nearby places. Check your internet connection.');
    } finally {
      // This is the key change: turn off the loading overlay
      setLoading(false);
    }
  };
  
  /**
   * This function is now called by the map itself when it first finds the user's location.
   */
  const onMapReady = () => {
    if (Platform.OS === 'android' && permissionGranted) {
        // This is a failsafe to get location if onUserLocationChange doesn't fire immediately
        // We will remove it later if not needed, but it helps prevent getting stuck.
    }
  };

  const onUserLocationChange = (event) => {
    // We use a ref flag to make sure this block only runs ONCE.
    if (!initialLocationFetched.current && event.nativeEvent.coordinate) {
      initialLocationFetched.current = true;
      const { latitude, longitude } = event.nativeEvent.coordinate;

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }, 1000);
      }
      fetchNearbyPlaces(latitude, longitude);
    }
  };

  if (!permissionGranted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: errorMsg ? 'red' : 'black', textAlign: 'center' }}>
          {errorMsg || 'Requesting location permission...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onMapReady={onMapReady}
        onUserLocationChange={onUserLocationChange}
      >
        {!loading && places.map((place) => (
          <Marker
            key={place.place_id}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            title={place.name}
            description={place.vicinity}
            pinColor={place.types.includes('veterinary_care') ? 'tan' : 'orange'}
          />
        ))}
      </MapView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: 'white' }}>Finding your location...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapScreen;