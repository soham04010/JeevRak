import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Relative path for robustness

const ConsultantScreen: React.FC<any> = ({ navigation }) => {
    const { token, axiosInstance, user } = useAuth();
    const [consultants, setConsultants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchConsultants = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            // Backend endpoint is /users/consultants
            const res = await axiosInstance(token).get(`/users/consultants?search=${search}`);
            
            // Filter out the currently logged in user (prevents self-messaging)
            const filtered = res.data.data.filter((c: any) => c._id !== user?._id);
            setConsultants(filtered);
        } catch (e) { 
            console.error("Consultant fetch error:", e); 
        } 
        finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, search, user]);

    useEffect(() => {
        // Debounce search input to avoid hitting the API too frequently
        const timer = setTimeout(() => fetchConsultants(), 500);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <Image 
                source={{ uri: item.profilePicture || 'https://placehold.co/400x400/CCCCCC/000000?text=Profile' }} 
                style={styles.avatar} 
            />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.expertise}>{item.expertise?.join(', ')}</Text>
            </View>
            <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('Chat', { recipient: item })}>
                <Text style={styles.chatText}>Chat</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8f9fa'}}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.inboxBtn} onPress={() => navigation.navigate('Inbox')}>
                    <Text style={styles.inboxText}>📂 View Inbox</Text>
                </TouchableOpacity>

                <Text style={styles.header}>Find a Vet</Text>
                <TextInput 
                    style={styles.search} 
                    placeholder="Search by name or expertise..." 
                    placeholderTextColor="#999"
                    value={search}
                    onChangeText={setSearch} 
                />
                {loading ? <ActivityIndicator size="large" color="#7C4DFF" style={{marginTop: 30}} /> : (
                    <FlatList 
                        data={consultants} 
                        renderItem={renderItem} 
                        keyExtractor={(item: any) => item._id} 
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={<Text style={styles.empty}>No consultants found.</Text>}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
    inboxBtn: { backgroundColor: '#FF9800', padding: 12, borderRadius: 10, marginBottom: 15, alignItems: 'center' },
    inboxText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    header: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    search: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 15, fontSize: 16, color: '#000000', elevation: 2 },
    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, alignItems: 'center', elevation: 2 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee', marginRight: 15 },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
    expertise: { fontSize: 13, color: '#666' },
    chatBtn: { backgroundColor: '#7C4DFF', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
    chatText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    empty: { textAlign: 'center', marginTop: 30, color: '#999' }
});

export default ConsultantScreen;