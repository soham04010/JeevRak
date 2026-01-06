import React, { useState } from 'react';
import { 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, ScrollView, SafeAreaView, Alert 
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CartScreen: React.FC = () => {
    const { state, removeFromCart, clearCart } = useCart();
    const { token, axiosInstance } = useAuth();
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [mobile, setMobile] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD'); // Default COD

    const totalPrice = state.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    const handleCheckout = async () => {
        if (!address || !city || !mobile) {
            return Alert.alert('Missing Info', 'Please fill in all address details.');
        }

        try {
            const orderData = {
                orderItems: state.cartItems,
                shippingAddress: { address, city, postalCode, country: 'India', mobile },
                paymentMethod,
                itemsPrice: totalPrice,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: totalPrice
            };

            await axiosInstance(token!).post('/orders', orderData);
            
            clearCart();
            Alert.alert('Order Placed!', 'Your order has been placed successfully.', [
                { text: 'OK' } 
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to place order.');
        }
    };

    if (state.cartItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>Your cart is empty</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.title}>Shopping Cart</Text>
                
                {/* Items */}
                {state.cartItems.map((item) => (
                    <View key={item.product} style={styles.item}>
                        <Image source={{ uri: item.image }} style={styles.image} />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.price}>₹{item.price} x {item.qty}</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeFromCart(item.product)}>
                            <Ionicons name="trash-outline" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Shipping Form */}
                <Text style={styles.sectionTitle}>Shipping Details</Text>
                <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} placeholderTextColor="#999" />
                <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} placeholderTextColor="#999" />
                <TextInput style={styles.input} placeholder="Postal Code" value={postalCode} onChangeText={setPostalCode} keyboardType="numeric" placeholderTextColor="#999" />
                <TextInput style={styles.input} placeholder="Mobile Number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" placeholderTextColor="#999" />

                {/* Payment Selection */}
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentRow}>
                    <TouchableOpacity 
                        style={[styles.payOption, paymentMethod === 'COD' && styles.selectedPay]} 
                        onPress={() => setPaymentMethod('COD')}
                    >
                        <Text style={paymentMethod === 'COD' ? styles.payTextSelected : styles.payText}>Cash on Delivery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.payOption, paymentMethod === 'Online' && styles.selectedPay]} 
                        onPress={() => setPaymentMethod('Online')}
                    >
                        <Text style={paymentMethod === 'Online' ? styles.payTextSelected : styles.payText}>Online (Stripe/Razorpay)</Text>
                    </TouchableOpacity>
                </View>

                {/* Summary */}
                <View style={styles.summary}>
                    <Text style={styles.totalText}>Total: ₹{totalPrice}</Text>
                    <TouchableOpacity style={styles.placeBtn} onPress={handleCheckout}>
                        <Text style={styles.placeText}>Place Order</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 18, color: '#999', marginTop: 10 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    item: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10 },
    image: { width: 50, height: 50, borderRadius: 5 },
    name: { fontSize: 16, fontWeight: '600', color: '#333' },
    price: { color: '#4CAF50', fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#333' },
    input: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginBottom: 10, color: '#000' },
    paymentRow: { flexDirection: 'row', justifyContent: 'space-between' },
    payOption: { flex: 1, padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
    selectedPay: { backgroundColor: '#7C4DFF', borderColor: '#7C4DFF' },
    payText: { color: '#333' },
    payTextSelected: { color: '#fff', fontWeight: 'bold' },
    summary: { marginTop: 30, borderTopWidth: 1, borderColor: '#eee', paddingTop: 20 },
    totalText: { fontSize: 22, fontWeight: 'bold', textAlign: 'right', marginBottom: 15, color: '#333' },
    placeBtn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, alignItems: 'center' },
    placeText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});

export default CartScreen;