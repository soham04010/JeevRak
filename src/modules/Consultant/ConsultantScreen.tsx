import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const ConsultantScreen: React.FC<any> = ({ navigation }) => {
    const { token, axiosInstance, user } = useAuth();
    const [consultants, setConsultants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchConsultants = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axiosInstance(token).get(`/users/consultants?search=${search}`);
            const filtered = res.data.data.filter((c: any) => c._id !== user?._id);
            setConsultants(filtered);
        } catch (e) { 
            console.error(e); 
        } 
        finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, search, user]);

    useEffect(() => {
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
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                <Text style={styles.chatText}>Chat</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Find a Vet</Text>
                {/* IMPROVED INBOX BUTTON: Small, clean icon button */}
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Inbox')}>
                    <Ionicons name="mail-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput 
                        style={styles.search} 
                        placeholder="Search by name or expertise..." 
                        placeholderTextColor="#999"
                        value={search}
                        onChangeText={setSearch} 
                    />
                </View>

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
    safeArea: {
        flex: 1, 
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
    },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#333' },
    iconBtn: { padding: 8, backgroundColor: '#f0f0f0', borderRadius: 20 },
    
    content: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 15, paddingTop: 15 },
    
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        elevation: 2,
        height: 50,
    },
    searchIcon: { marginRight: 10 },
    search: { flex: 1, fontSize: 16, color: '#000' },

    card: { 
        flexDirection: 'row', 
        backgroundColor: '#fff', 
        padding: 15, 
        borderRadius: 16, 
        marginBottom: 12, 
        alignItems: 'center', 
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee', marginRight: 15 },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#000' },
    expertise: { fontSize: 13, color: '#666', marginTop: 2 },
    
    chatBtn: { 
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7C4DFF', 
        paddingVertical: 8, 
        paddingHorizontal: 12, 
        borderRadius: 20 
    },
    chatText: { color: '#fff', fontWeight: 'bold', fontSize: 13, marginLeft: 5 },
    empty: { textAlign: 'center', marginTop: 30, color: '#999' }
});

export default ConsultantScreen;