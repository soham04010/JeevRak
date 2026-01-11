import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, ActivityIndicator, Linking, Platform 
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import GetLocation from 'react-native-get-location';
import { useAuth } from '../../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const MapScreen: React.FC = () => {
    const { token, axiosInstance } = useAuth();
    const mapRef = useRef<MapView>(null);

    const [location, setLocation] = useState<any>(null);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlace, setSelectedPlace] = useState<any>(null);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        try {
            const loc = await GetLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 15000,
            });
            setLocation(loc);
            fetchNearby(loc.latitude, loc.longitude);
        } catch (error) {
            console.warn("Location error:", error);
            setLoading(false);
        }
    };

    const fetchNearby = async (lat: number, lng: number) => {
        try {
            const res = await axiosInstance(token!).get(`/nearby?lat=${lat}&lng=${lng}`);
            setPlaces(res.data.data);
        } catch (error) {
            console.error("Fetch Error", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceSelect = (place: any) => {
        setSelectedPlace(place);
        mapRef.current?.animateToRegion({
            latitude: place.location.lat,
            longitude: place.location.lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }, 1000);
    };

    const openNavigation = (lat: number, lng: number, name: string) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const url = Platform.select({
            ios: `${scheme}${name}@${latLng}`,
            android: `${scheme}${latLng}(${name})`
        });
        if (url) Linking.openURL(url);
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#7C4DFF" />
            <Text style={{marginTop: 10, color: '#666'}}>Scanning your area...</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: location?.latitude || 20.5937,
                    longitude: location?.longitude || 78.9629,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
            >
                {places.map((place: any) => (
                    <Marker
                        key={place.id}
                        coordinate={{ latitude: place.location.lat, longitude: place.location.lng }}
                        onPress={() => setSelectedPlace(place)}
                    >
                        <View style={[styles.pin, { backgroundColor: place.type === 'Clinic' ? '#FF5252' : '#7C4DFF' }]}>
                            <Ionicons name={place.type === 'Clinic' ? "medical" : "cart"} size={16} color="white" />
                        </View>
                        <Callout onPress={() => openNavigation(place.location.lat, place.location.lng, place.name)}>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{place.name}</Text>
                                <Text style={styles.calloutDesc}>Tap to navigate</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            <View style={styles.listContainer}>
                <Text style={styles.listHeader}>Nearest Services</Text>
                <FlatList
                    horizontal
                    data={places}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={[styles.card, selectedPlace?.id === item.id && styles.selectedCard]}
                            onPress={() => handlePlaceSelect(item)}
                        >
                            <Text style={[styles.cardType, {color: item.type === 'Clinic' ? '#FF5252' : '#7C4DFF'}]}>
                                {item.type.toUpperCase()}
                            </Text>
                            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.cardAddr} numberOfLines={1}>{item.address}</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={14} color="#FFD700" />
                                <Text style={styles.ratingText}>{item.rating || 'N/A'}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    map: { width: width, height: height * 0.7 },
    pin: { padding: 6, borderRadius: 20, borderWidth: 2, borderColor: 'white', elevation: 5 },
    callout: { padding: 5, minWidth: 100 },
    calloutTitle: { fontWeight: 'bold', fontSize: 12 },
    calloutDesc: { fontSize: 10, color: '#7C4DFF', marginTop: 2 },
    listContainer: {
        position: 'absolute', bottom: 0, backgroundColor: 'white', 
        width: width, height: height * 0.3, borderTopLeftRadius: 30, borderTopRightRadius: 30,
        padding: 20, elevation: 20
    },
    listHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    card: {
        backgroundColor: '#f8f9fa', width: 240, height: 110, borderRadius: 15,
        padding: 15, marginRight: 15, borderWidth: 1, borderColor: '#eee'
    },
    selectedCard: { borderColor: '#7C4DFF', backgroundColor: '#F3E5F5' },
    cardType: { fontSize: 10, fontWeight: '800', marginBottom: 5 },
    cardName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    cardAddr: { fontSize: 12, color: '#777', marginTop: 2 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    ratingText: { marginLeft: 5, fontSize: 12, fontWeight: '600', color: '#444' }
});

export default MapScreen;