import React, { useState, useEffect } from 'react';
import { 
    View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Alert 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProductDetailScreen: React.FC<any> = ({ route, navigation }) => {
    const { productId } = route.params;
    const { token, axiosInstance } = useAuth();
    const { addToCart } = useCart();
    
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axiosInstance(token!).get(`/products/${productId}`);
                setProduct(res.data.data);
            } catch (error) {
                Alert.alert('Error', 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleAddToCart = () => {
        if (!product || product.countInStock === 0) return;
        addToCart({
            product: product._id,
            name: product.name,
            image: product.images[0],
            price: product.price,
            countInStock: product.countInStock,
            qty
        });
        Alert.alert('Added to Cart', `${product.name} added!`, [
            { text: 'Continue Shopping', style: 'cancel' },
            { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') }
        ]);
    };

    if (loading) return <ActivityIndicator size="large" color="#7C4DFF" style={{marginTop: 50}} />;
    if (!product) return <Text style={{padding: 20}}>Product not found</Text>;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 10}}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Main Image */}
                <Image 
                    source={{ uri: product.images[activeImageIndex] || 'https://placehold.co/400x400' }} 
                    style={styles.mainImage} 
                />

                {/* Thumbnail Strip */}
                {product.images && product.images.length > 1 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbContainer}>
                        {product.images.map((img: string, index: number) => (
                            <TouchableOpacity key={index} onPress={() => setActiveImageIndex(index)}>
                                <Image 
                                    source={{ uri: img }} 
                                    style={[styles.thumb, activeImageIndex === index && styles.activeThumb]} 
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
                
                <View style={styles.details}>
                    <Text style={styles.brand}>{product.brand}</Text>
                    <Text style={styles.name}>{product.name}</Text>
                    
                    <View style={styles.ratingRow}>
                        <Text style={styles.rating}>⭐ {product.rating || 0} ({product.numReviews || 0} Reviews)</Text>
                        <Text style={[styles.stock, {color: product.countInStock > 0 ? 'green' : 'red'}]}>
                            {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                        </Text>
                    </View>
                    
                    <Text style={styles.price}>₹{product.price}</Text>
                    
                    <View style={styles.divider} />

                    <Text style={styles.descTitle}>Description</Text>
                    <Text style={styles.description}>{product.description}</Text>

                    {product.sellerAddress && (
                        <View style={styles.sellerInfo}>
                            <Text style={styles.descTitle}>Seller Info</Text>
                            <Text style={styles.sellerText}>Address: {product.sellerAddress}</Text>
                            <Text style={styles.sellerText}>Contact: {product.sellerContact}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.qtyContainer}>
                    <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))} style={styles.qtyBtn}>
                        <Text style={styles.qtyText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyVal}>{qty}</Text>
                    <TouchableOpacity onPress={() => setQty(Math.min(product.countInStock, qty + 1))} style={styles.qtyBtn}>
                        <Text style={styles.qtyText}>+</Text>
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                    style={[styles.buyBtn, product.countInStock === 0 && styles.disabledBtn]} 
                    onPress={handleAddToCart}
                    disabled={product.countInStock === 0}
                >
                    <Text style={styles.buyText}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: { paddingHorizontal: 10, paddingTop: 10 },
    mainImage: { width: '100%', height: 300, resizeMode: 'contain', backgroundColor: '#fff' },
    thumbContainer: { paddingHorizontal: 20, marginTop: 10, height: 70 },
    thumb: { width: 60, height: 60, marginRight: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
    activeThumb: { borderColor: '#7C4DFF', borderWidth: 2 },
    
    details: { padding: 20 },
    brand: { fontSize: 14, color: '#999', fontWeight: '600', textTransform: 'uppercase' },
    name: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    ratingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, marginTop: 5 },
    rating: { color: '#FF9800', fontWeight: '600' },
    stock: { fontWeight: '600' },
    price: { fontSize: 28, fontWeight: 'bold', color: '#4CAF50' },
    
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    
    descTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
    description: { fontSize: 15, color: '#666', lineHeight: 22 },
    
    sellerInfo: { marginTop: 20, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 10 },
    sellerText: { fontSize: 14, color: '#555', marginBottom: 2 },

    footer: { 
        padding: 20, borderTopWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' 
    },
    qtyContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    qtyBtn: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
    qtyText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    qtyVal: { marginHorizontal: 15, fontSize: 18, fontWeight: 'bold', color: '#333' },
    buyBtn: { flex: 1, backgroundColor: '#7C4DFF', padding: 15, borderRadius: 30, alignItems: 'center' },
    disabledBtn: { backgroundColor: '#ccc' },
    buyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default ProductDetailScreen;