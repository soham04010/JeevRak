import React, { useState, useCallback } from 'react';
import { 
    View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, TextInput, Alert 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProductScreen: React.FC<any> = ({ navigation }) => {
    const { token, axiosInstance, user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Admin Check logic: Matches backend role requirement
    const isAdmin = user?.role === 'admin';

    const fetchProducts = async () => {
        try {
            const res = await axiosInstance(token!).get(`/products?keyword=${search}`);
            setProducts(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => {
        fetchProducts();
    }, [search]));

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Product",
            "Are you sure you want to delete this product?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axiosInstance(token!).delete(`/products/${id}`);
                            // Refresh list locally
                            setProducts(prev => prev.filter((p: any) => p._id !== id));
                            Alert.alert("Success", "Product deleted");
                        } catch (error) {
                            Alert.alert("Error", "Could not delete product. Ensure you are Admin.");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}>
            <Image 
                source={{ uri: item.images && item.images.length > 0 ? item.images[0] : 'https://placehold.co/200x200' }} 
                style={styles.image} 
            />
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            
            <View style={styles.row}>
                <Text style={styles.price}>₹{item.price}</Text>
                
                {/* Admin sees Delete button */}
                {isAdmin && (
                    <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                        <Ionicons name="trash-outline" size={22} color="red" />
                    </TouchableOpacity>
                )}
                 {/* Standard users see 'Add to Cart' visual cue (functionality is in Detail screen) */}
                 {!isAdmin && (
                    <Ionicons name="add-circle" size={28} color="#7C4DFF" />
                 )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Pet Store</Text>
                
                <View style={{flexDirection:'row'}}>
                    {/* Show Add Product Button ONLY if Admin */}
                    {isAdmin && (
                        <TouchableOpacity onPress={() => navigation.navigate('AddProduct')} style={{marginRight: 15}}>
                            <Ionicons name="create-outline" size={28} color="#FF9800" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
                        <Ionicons name="cart-outline" size={28} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput 
                    style={styles.input} 
                    placeholder="Search medicines, food..." 
                    placeholderTextColor="#999"
                    value={search} 
                    onChangeText={setSearch}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#7C4DFF" style={{marginTop: 50}} />
            ) : (
                <FlatList 
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={(item: any) => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20}}>No products found.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    searchContainer: { 
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
        marginHorizontal: 20, paddingHorizontal: 15, borderRadius: 12, height: 50, marginBottom: 10, elevation: 2 
    },
    input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#000' },
    list: { paddingHorizontal: 10, paddingBottom: 20 },
    card: { 
        flex: 1, backgroundColor: '#fff', margin: 8, borderRadius: 15, padding: 10, 
        elevation: 3, shadowColor: '#000', shadowOffset: {width:0, height: 2}, shadowOpacity: 0.1 
    },
    image: { width: '100%', height: 120, resizeMode: 'contain', marginBottom: 10 },
    name: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5, height: 40 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
    deleteBtn: { padding: 5 }
});

export default ProductScreen;