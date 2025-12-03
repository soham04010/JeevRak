import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, StatusBar 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const ChatScreen: React.FC<any> = ({ route, navigation }) => {
    const { recipient } = route.params;
    const { user, socket, axiosInstance, token } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // 1. Fetch Chat History
        if (token) {
             axiosInstance(token).get(`/messages/${recipient._id}`)
                .then(res => {
                    setMessages(res.data.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching history:', err);
                    setLoading(false);
                });
        }

        // 2. Socket Listener for INCOMING messages
        if (socket) {
            const handleMsg = (msg: any) => {
                // BUG FIX: Ignore messages sent by ME, because I already added them optimistically
                if (msg.sender === user?._id) return; 

                // Only add messages belonging to this conversation
                if (msg.sender === recipient._id) {
                    setMessages(prev => [...prev, msg]);
                }
            };
            socket.on('message', handleMsg);
            return () => { socket.off('message', handleMsg); };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipient._id, token, socket]);
    
    // Auto scroll to bottom
    useEffect(() => {
        const timer = setTimeout(() => {
             flatListRef.current?.scrollToEnd({ animated: true });
        }, 200); // Slight delay helps with layout calculation
        return () => clearTimeout(timer);
    }, [messages]);

    const send = () => {
        if (!text.trim()) return;

        // 3. OPTIMISTIC UPDATE: Show message immediately
        const newMessage = {
            _id: Date.now().toString() + Math.random(), // Unique temp ID
            text: text.trim(),
            sender: user?._id,
            recipient: recipient._id,
            sentAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, newMessage]);
        const msgToSend = text.trim();
        setText(''); 

        // 4. Send to server
        if (socket && socket.connected) {
            socket.emit('sendMessage', { recipientId: recipient._id, text: msgToSend });
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isMe = item.sender === user?._id;
        const time = new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return (
            <View style={[styles.bubbleWrapper, isMe ? styles.meWrapper : styles.themWrapper]}>
                <View style={[styles.bubble, isMe ? styles.me : styles.them]}>
                    <Text style={[styles.msgText, isMe ? styles.textMe : styles.textThem]}>{item.text}</Text>
                </View>
                <Text style={styles.time}>{time}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{recipient.name}</Text>
                    <Text style={styles.headerSub}>Online</Text>
                </View>
                <View style={{width: 24}} /> 
            </View>
            
            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#7C4DFF" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item, index) => item._id || index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
                />
            )}

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputBar}>
                    <TextInput 
                        style={styles.input} 
                        value={text} 
                        onChangeText={setText} 
                        placeholder="Type a message..." 
                        placeholderTextColor="#999"
                        multiline
                    />
                    <TouchableOpacity onPress={send} style={styles.sendBtn} disabled={!text.trim()}>
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        // FIX: Adds padding for Android Status Bar
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingVertical: 12,
        paddingHorizontal: 15, 
        backgroundColor: '#fff', 
        elevation: 2, 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee' 
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    headerSub: { fontSize: 12, color: '#4CAF50', textAlign: 'center' }, // "Online" status
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    bubbleWrapper: { marginBottom: 12, maxWidth: '80%' },
    meWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    themWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    
    bubble: { padding: 12, borderRadius: 16 },
    me: { backgroundColor: '#7C4DFF', borderBottomRightRadius: 2 },
    them: { backgroundColor: '#fff', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#e0e0e0' },
    
    msgText: { fontSize: 16, lineHeight: 22 },
    textMe: { color: '#fff' },
    textThem: { color: '#000' },
    
    time: { fontSize: 10, color: '#888', marginTop: 4, marginHorizontal: 2 },
    
    inputBar: { 
        flexDirection: 'row', 
        alignItems: 'flex-end', 
        padding: 10, 
        backgroundColor: '#fff', 
        borderTopWidth: 1, 
        borderTopColor: '#ddd' 
    },
    input: { 
        flex: 1, 
        backgroundColor: '#f9f9f9', 
        borderRadius: 20, 
        paddingHorizontal: 15, 
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 16,
        color: '#000',
        borderWidth: 1,
        borderColor: '#eee'
    },
    sendBtn: { 
        backgroundColor: '#7C4DFF', 
        width: 44, 
        height: 44, 
        borderRadius: 22, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginLeft: 10,
        marginBottom: 2
    }
});

export default ChatScreen;