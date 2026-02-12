import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, ImageBackground, Modal, StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PET_CATEGORIES, DIET_PLANS } from './homeData'; // Import data
import { useAuth } from '../../context/AuthContext'; // Import AuthContext

const HomeScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('Dogs');
    const [dailyFact, setDailyFact] = useState<string | null>(null);
    const [loadingFact, setLoadingFact] = useState(true);

    // State for Diet Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    useEffect(() => {
        fetchFact();
    }, []);

    const fetchFact = async () => {
        setLoadingFact(true);
        try {
            const response = await fetch('https://catfact.ninja/fact');
            const data = await response.json();
            setDailyFact(data.fact);
        } catch (error) {
            setDailyFact("Pets make the world a better place!");
        } finally {
            setLoadingFact(false);
        }
    };

    const handleOpenDiet = (item: any) => {
        setSelectedPlan(item);
        setModalVisible(true);
    };

    const renderCategoryItem = ({ item }: any) => {
        const isSelected = selectedCategory === item.name;
        return (
            <TouchableOpacity
                style={[styles.catItem, isSelected && styles.catItemSelected]}
                onPress={() => setSelectedCategory(item.name)}
            >
                <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                    <MaterialCommunityIcons
                        name={item.icon}
                        size={24}
                        color={isSelected ? '#fff' : '#7C4DFF'}
                    />
                </View>
                <Text style={[styles.catName, isSelected && styles.catNameSelected]}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    const renderDietCard = ({ item }: any) => (
        <TouchableOpacity
            style={styles.dietCard}
            onPress={() => handleOpenDiet(item)} // Open Modal on click
            activeOpacity={0.9}
        >
            <View style={styles.dietHeader}>
                <Text style={styles.dietTitle}>{item.title}</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#aaa" />
            </View>
            <Text style={styles.dietDesc} numberOfLines={2}>{item.description}</Text>

            <View style={styles.dietFooter}>
                <View style={styles.kcalBadge}>
                    <MaterialCommunityIcons name="fire" size={14} color="#2E7D32" />
                    <Text style={styles.kcalText}>{item.kcal}</Text>
                </View>
                <Text style={styles.clickHint}>Tap for details</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
            {/* 1. Reliable Background Image */}
            <ImageBackground
                // Using a high-quality Unsplash image of a dog and cat
                source={{ uri: 'https://i.pinimg.com/originals/4a/94/26/4a94268541d7a0ed95a8be5138e8a288.jpg' }}
                style={styles.backgroundImage}
                imageStyle={{ opacity: 0.40, resizeMode: 'cover' }} // Low opacity for readability
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                    {/* 2. Personalized Header */}
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.greeting} numberOfLines={1}>
                                Hello, {user?.name || 'Guardian'}! 👋
                            </Text>
                            <Text style={styles.subGreeting}>How is your pet doing?</Text>
                        </View>
                        <Image
                            // Fallback to a nice avatar if user has no photo
                            source={{ uri: user?.profilePicture && user.profilePicture.length > 10 ? user.profilePicture : 'https://placehold.co/100x100/png?text=Pet' }}
                            style={styles.avatar}
                        />
                    </View>

                    {/* 3. Daily Fact Card */}
                    <View style={styles.newsCard}>
                        <View style={styles.newsContent}>
                            <View style={styles.newsHeader}>
                                <Ionicons name="bulb" size={18} color="#FF9800" style={{ marginRight: 5 }} />
                                <Text style={styles.newsTitle}>DID YOU KNOW?</Text>
                            </View>
                            {loadingFact ? (
                                <ActivityIndicator size="small" color="#673AB7" />
                            ) : (
                                <Text style={styles.newsText}>“{dailyFact}”</Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={fetchFact} style={styles.refreshBtn}>
                            <Ionicons name="reload-circle" size={28} color="#7C4DFF" />
                        </TouchableOpacity>
                    </View>



                    {/* 4. Categories */}
                    <Text style={styles.sectionTitle}>Pet Categories</Text>
                    <FlatList
                        horizontal
                        data={PET_CATEGORIES}
                        renderItem={renderCategoryItem}
                        keyExtractor={item => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.catList}
                    />

                    {/* 5. Diet Plans Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Diet Plans for {selectedCategory}</Text>
                        <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                    </View>

                    <FlatList
                        data={DIET_PLANS[selectedCategory] || []}
                        renderItem={renderDietCard}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                        ListEmptyComponent={<Text style={styles.emptyText}>No plans available for this category yet.</Text>}
                    />

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Floating ChatBot Icon */}
                <TouchableOpacity
                    style={styles.chatbotFloatingBtn}
                    onPress={() => navigation.navigate('ChatBot' as never)}
                    activeOpacity={0.8}
                >
                    <View>
                        <MaterialCommunityIcons name="robot" size={28} color="#FFF" />
                    </View>
                </TouchableOpacity>
            </ImageBackground>

            {/* 6. Diet Plan Details Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedPlan && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                                        <MaterialCommunityIcons name="food-apple" size={30} color="#4CAF50" />
                                    </View>
                                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                        <Ionicons name="close" size={24} color="#555" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.modalTitle}>{selectedPlan.title}</Text>
                                <Text style={styles.modalCategory}>Category: {selectedCategory}</Text>

                                <View style={styles.divider} />

                                <Text style={styles.modalLabel}>Description</Text>
                                <Text style={styles.modalDesc}>{selectedPlan.description}</Text>

                                <Text style={styles.modalLabel}>Nutritional Value</Text>
                                <View style={styles.modalBadge}>
                                    <Text style={styles.modalBadgeText}>{selectedPlan.kcal}</Text>
                                </View>

                                <TouchableOpacity style={styles.adoptBtn} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.adoptBtnText}>Use This Plan</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    backgroundImage: { flex: 1, width: '100%', height: '100%' },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 20,
    },
    greeting: { fontSize: 26, fontWeight: 'bold', color: '#222' },
    subGreeting: { fontSize: 15, color: '#666', marginTop: 2 },
    avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#ddd', borderWidth: 2, borderColor: '#fff' },

    newsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#E1BEE7', // Light purple border
        elevation: 4,
        shadowColor: '#7C4DFF',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 }
    },
    newsContent: { flex: 1 },
    newsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    newsTitle: { fontSize: 13, fontWeight: '800', color: '#7C4DFF', letterSpacing: 0.5 },
    newsText: { fontSize: 15, color: '#333', fontStyle: 'italic', lineHeight: 22 },
    refreshBtn: { padding: 5, marginLeft: 5 },

    chatbotFloatingBtn: {
        position: 'absolute',
        bottom: 65,
        right: 20,
        backgroundColor: '#6C63FF',
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#6C63FF',
        shadowOpacity: 0.4,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        zIndex: 100,
        borderWidth: 2,
        borderColor: '#FFF',
    },

    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', marginLeft: 20, marginBottom: 15 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20, marginTop: 10, marginBottom: 15 },
    seeAll: { color: '#7C4DFF', fontWeight: '600', fontSize: 14 },

    catList: { paddingLeft: 20, paddingBottom: 10 },
    catItem: {
        alignItems: 'center', marginRight: 15, backgroundColor: '#fff',
        padding: 10, borderRadius: 16, width: 85, height: 100, justifyContent: 'center',
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4
    },
    catItemSelected: { backgroundColor: '#7C4DFF', elevation: 6 },
    iconCircle: {
        width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#F3E5F5',
        justifyContent: 'center', alignItems: 'center', marginBottom: 8
    },
    iconCircleSelected: { backgroundColor: 'rgba(255,255,255,0.2)' },
    catName: { fontSize: 13, fontWeight: '600', color: '#555' },
    catNameSelected: { color: '#fff', fontWeight: 'bold' },

    dietCard: {
        backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 15,
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 5,
        borderLeftWidth: 5, borderLeftColor: '#4CAF50'
    },
    dietHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    dietTitle: { fontSize: 17, fontWeight: 'bold', color: '#222' },
    dietDesc: { fontSize: 14, color: '#666', marginBottom: 12, lineHeight: 20 },
    dietFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    kcalBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9',
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8
    },
    kcalText: { fontSize: 12, color: '#2E7D32', fontWeight: 'bold', marginLeft: 4 },
    clickHint: { fontSize: 12, color: '#aaa' },
    emptyText: { textAlign: 'center', color: '#888', marginTop: 10, fontStyle: 'italic' },

    // Modal Styles
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25,
        padding: 25, minHeight: 400, elevation: 5
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    closeBtn: { padding: 5, backgroundColor: '#f0f0f0', borderRadius: 20 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    modalCategory: { fontSize: 14, color: '#7C4DFF', fontWeight: '600', marginBottom: 15 },
    divider: { height: 1, backgroundColor: '#eee', marginBottom: 20 },
    modalLabel: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 8 },
    modalDesc: { fontSize: 16, color: '#444', lineHeight: 24, marginBottom: 20 },
    modalBadge: {
        backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 15,
        paddingVertical: 8, borderRadius: 8, marginBottom: 30
    },
    modalBadgeText: { fontSize: 16, color: '#2E7D32', fontWeight: 'bold' },
    adoptBtn: {
        backgroundColor: '#7C4DFF', borderRadius: 15, paddingVertical: 16, alignItems: 'center',
        shadowColor: '#7C4DFF', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, elevation: 5
    },
    adoptBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default HomeScreen;