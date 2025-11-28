import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const InboxScreen: React.FC<any> = ({ navigation }) => {
    const { token, axiosInstance } = useAuth();
    const [inbox, setInbox] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInbox = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axiosInstance(token).get('/messages/inbox');
            console.log("Inbox Data:", res.data.data); // DEBUG LOG
            setInbox(res.data.data);
        } catch (e) {
            console.error('Inbox fetch error', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);
    
    // Automatically refresh when screen opens
    useFocusEffect(useCallback(() => {
        fetchInbox();
    }, [fetchInbox]));

    const onRefresh = () => {
        setRefreshing(true);
        fetchInbox();
    };

    const renderItem = ({ item }: any) => {
        // Format Date
        const date = new Date(item.sentAt);
        const timeString = date.toLocaleDateString() === new Date().toLocaleDateString() 
            ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
            : date.toLocaleDateString();

        return (
            <TouchableOpacity 
                style={styles.card} 
                onPress={() => navigation.navigate('Chat', { recipient: item.otherUser })}
            >
                <Image 
                    source={{ uri: item.otherUser.profilePicture || 'https://placehold.co/400x400/CCCCCC/000000?text=User' }} 
                    style={styles.avatar} 
                />
                <View style={styles.info}>
                    <View style={styles.topRow}>
                        <Text style={styles.name}>{item.otherUser.name}</Text>
                        <Text style={styles.time}>{timeString}</Text>
                    </View>
                    <Text numberOfLines={1} style={styles.lastMsg}>{item.lastMessage}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f5f5f5'}}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#7C4DFF" />
                </View>
            ) : (
                <FlatList 
                    data={inbox} 
                    renderItem={renderItem} 
                    keyExtractor={(item) => item.conversationId}
                    contentContainerStyle={{padding: 15}}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7C4DFF']} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>No messages yet</Text>
                            <Text style={styles.emptyText}>Start a chat with a vet to see it here.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { 
        padding: 20, 
        backgroundColor: '#fff', 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee',
        elevation: 2 
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#000' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    card: { 
        flexDirection: 'row', 
        backgroundColor: '#fff', 
        padding: 15, 
        borderRadius: 16, 
        marginBottom: 12, 
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4
    },
    avatar: { 
        width: 55, 
        height: 55, 
        borderRadius: 27.5, 
        marginRight: 15, 
        backgroundColor: '#f0f0f0' 
    },
    info: { flex: 1, justifyContent: 'center' },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    name: { fontSize: 16, fontWeight: '700', color: '#000' },
    time: { fontSize: 12, color: '#999', fontWeight: '500' },
    lastMsg: { fontSize: 14, color: '#666', lineHeight: 20 },
    
    emptyContainer: { alignItems: 'center', marginTop: 100, padding: 20 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#ccc', marginBottom: 10 },
    emptyText: { fontSize: 14, color: '#aaa', textAlign: 'center' }
});

export default InboxScreen;