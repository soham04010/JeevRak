import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { useTheme, Text } from 'react-native-paper';
// @ts-ignore
import { GOOGLE_MAPS_API_KEY } from '@env';


const Map = () => {
  const { colors } = useTheme();
  const [location, setLocation] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!GOOGLE_MAPS_API_KEY) {
        setErrorMsg('API Key is missing. Please check your .env file.');
        setLoading(false);
        return;
      }
      
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = {
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          setLocation(userLocation);
          fetchNearbyPlaces(latitude, longitude);
        },
        (error) => {
          console.error(error);
          setErrorMsg('Could not get your location. Please ensure GPS is enabled.');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    };

    initializeMap();
  }, []);

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show nearby places.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        setErrorMsg('Permission error. Please enable location permission.');
        return false;
      }
    } else {
      // iOS permissions are handled by the library
      return true;
    }
  };

  const fetchNearbyPlaces = async (lat: number, lon: number) => {
    // ... (fetching logic remains the same)
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Loading Map & Services...</Text>
      </View>
    );
  }
  
  if (errorMsg) {
     return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{color: 'red', textAlign: 'center'}}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={location}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {places.map((place) => (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});

export default Map;