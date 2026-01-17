import React, { useState, useEffect } from 'react';
import { 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, ScrollView, SafeAreaView, Alert 
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CartScreen: React.FC = () => {
    const { state, removeFromCart, clearCart } = useCart();
    const { token, axiosInstance, user } = useAuth();
    
    // State to hold selected address
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [mobile, setMobile] = useState(user?.mobile || '');
    const [paymentMethod, setPaymentMethod] = useState('COD');

    // Automatically select default address or first address on load
    useEffect(() => {
        if (user?.addresses && user.addresses.length > 0) {
            const def = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
            setSelectedAddress(def);
        }
        if (user?.mobile) setMobile(user.mobile);
    }, [user]);

    const totalPrice = state.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    const handleCheckout = async () => {
        if (!selectedAddress || !mobile) {
            return Alert.alert('Missing Info', 'Please select an address and ensure mobile number is set.');
        }

        try {
            const orderData = {
                orderItems: state.cartItems,
                shippingAddress: { 
                    address: selectedAddress.address, 
                    city: selectedAddress.city, 
                    postalCode: selectedAddress.postalCode, 
                    country: 'India', 
                    mobile 
                },
                paymentMethod,
                totalPrice: totalPrice
            };

            const baseURL = axiosInstance(token!).defaults.baseURL;
            await axiosInstance(token!).post(`${baseURL}/orders`, orderData);
            
            clearCart();
            Alert.alert('Order Placed!', 'Success!');
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
                <Text style={styles.title}>Review Order</Text>
                
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

                {/* Address Selection */}
                <Text style={styles.sectionTitle}>Deliver To</Text>
                {user?.addresses && user.addresses.length > 0 ? (
                    user.addresses.map((addr: any, idx: number) => (
                        <TouchableOpacity 
                            key={idx} 
                            style={[styles.addressCard, selectedAddress?._id === addr._id && styles.selectedCard]}
                            onPress={() => setSelectedAddress(addr)}
                        >
                            <Ionicons 
                                name={selectedAddress?._id === addr._id ? "radio-button-on" : "radio-button-off"} 
                                size={20} 
                                color={selectedAddress?._id === addr._id ? "#7C4DFF" : "#999"} 
                            />
                            <View style={{marginLeft: 10}}>
                                <Text style={styles.addrText}>{addr.address}</Text>
                                <Text style={styles.cityText}>{addr.city}, {addr.postalCode}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={{color: 'red', marginBottom: 10}}>No saved addresses. Please add one in Profile.</Text>
                )}

                <Text style={styles.sectionTitle}>Contact Number</Text>
                <TextInput 
                    style={styles.input} 
                    value={mobile} 
                    onChangeText={setMobile} 
                    keyboardType="phone-pad" 
                    placeholder="Mobile Number"
                />

                <Text style={styles.sectionTitle}>Payment</Text>
                <View style={styles.paymentRow}>
                    <TouchableOpacity 
                        style={[styles.payOption, paymentMethod === 'COD' && styles.selectedPay]} 
                        onPress={() => setPaymentMethod('COD')}
                    >
                        <Text style={paymentMethod === 'COD' ? styles.payTextSelected : styles.payText}>COD</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.payOption, paymentMethod === 'Online' && styles.selectedPay]} 
                        onPress={() => setPaymentMethod('Online')}
                    >
                        <Text style={paymentMethod === 'Online' ? styles.payTextSelected : styles.payText}>Online</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.summary}>
                    <Text style={styles.totalText}>Total: ₹{totalPrice}</Text>
                    <TouchableOpacity 
                        style={[styles.placeBtn, !selectedAddress && {backgroundColor: '#ccc'}]} 
                        onPress={handleCheckout}
                        disabled={!selectedAddress}
                    >
                        <Text style={styles.placeText}>Confirm Order</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 18, color: '#999', marginTop: 10 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    item: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10 },
    image: { width: 50, height: 50, borderRadius: 5 },
    name: { fontSize: 16, fontWeight: '600' },
    price: { color: '#4CAF50', fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    addressCard: { flexDirection: 'row', padding: 15, borderBasis: 1, borderColor: '#ddd', borderWidth: 1, borderRadius: 12, marginBottom: 8, alignItems: 'center' },
    selectedCard: { borderColor: '#7C4DFF', backgroundColor: '#F3E5F5' },
    addrText: { fontWeight: 'bold', color: '#333' },
    cityText: { fontSize: 12, color: '#666' },
    input: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginBottom: 10 },
    paymentRow: { flexDirection: 'row', gap: 10 },
    payOption: { flex: 1, padding: 12, borderBasis: 1, borderColor: '#ddd', borderWidth: 1, borderRadius: 8, alignItems: 'center' },
    selectedPay: { backgroundColor: '#7C4DFF', borderColor: '#7C4DFF' },
    payText: { color: '#333' },
    payTextSelected: { color: '#fff', fontWeight: 'bold' },
    summary: { marginTop: 30, borderTopWidth: 1, borderColor: '#eee', paddingTop: 20 },
    totalText: { fontSize: 22, fontWeight: 'bold', textAlign: 'right', marginBottom: 15 },
    placeBtn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, alignItems: 'center' },
    placeText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});

export default CartScreen;