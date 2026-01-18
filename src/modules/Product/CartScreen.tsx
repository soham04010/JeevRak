import React, { useState, useEffect } from 'react';
import { 
    View, Text, TouchableOpacity, StyleSheet, Image, TextInput, ScrollView, SafeAreaView, Alert, ActivityIndicator, Modal
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CartScreen: React.FC = () => {
    const { state, removeFromCart, clearCart } = useCart();
    const { token, axiosInstance, user, setUser } = useAuth();
    
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [mobile, setMobile] = useState(user?.mobile || '');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // "Use another address" Modal state
    const [showNewAddrModal, setShowNewAddrModal] = useState(false);
    const [newAddr, setNewAddr] = useState({ street: '', city: '', state: '', zipCode: '' });

    useEffect(() => {
        if (user?.addresses && user.addresses.length > 0) {
            const def = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
            setSelectedAddress(def);
        }
        if (user?.mobile) setMobile(user.mobile);
    }, [user]);

    const totalPrice = state.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    const handleAddNewAddress = async () => {
        if (!newAddr.street || !newAddr.city || !newAddr.state || !newAddr.zipCode) {
            return Alert.alert('Error', 'Please fill all address fields');
        }
        setIsProcessing(true);
        try {
            const response = await axiosInstance(token!).post('/users/address', newAddr);
            const updatedAddresses = response.data.data;
            setUser({ ...user, addresses: updatedAddresses });
            
            // Automatically select the newly added address
            const added = updatedAddresses[updatedAddresses.length - 1];
            setSelectedAddress(added);
            
            setShowNewAddrModal(false);
            setNewAddr({ street: '', city: '', state: '', zipCode: '' });
        } catch (error) {
            Alert.alert('Error', 'Failed to add new address');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckout = async () => {
        if (!selectedAddress) return Alert.alert('Address Required', 'Please select or add a shipping address.');
        if (!mobile || mobile.length < 10) return Alert.alert('Mobile Required', 'Please provide a valid 10-digit mobile number.');

        setIsProcessing(true);
        try {
            const orderData = {
                orderItems: state.cartItems,
                shippingAddress: { 
                    address: selectedAddress.street, // Mapping street from backend to address field for Order
                    city: selectedAddress.city, 
                    postalCode: selectedAddress.zipCode, 
                    country: 'India', 
                    mobile 
                },
                paymentMethod,
                totalPrice: totalPrice
            };

            await axiosInstance(token!).post(`/orders`, orderData);
            
            clearCart();
            Alert.alert('Success', 'Order placed successfully!', [{ text: 'OK' }]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to place order.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (state.cartItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={80} color="#ddd" />
                <Text style={styles.emptyText}>Your cart is empty</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.title}>Checkout</Text>
                
                {/* Cart Items Summary */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    {state.cartItems.map((item) => (
                        <View key={item.product} style={styles.itemRow}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.itemSub}>Qty: {item.qty} • ₹{item.price}</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeFromCart(item.product)}>
                                <Ionicons name="close-circle" size={22} color="#ff4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Shipping Address */}
                <View style={styles.sectionCard}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.sectionTitle}>Shipping Address</Text>
                        <TouchableOpacity onPress={() => setShowNewAddrModal(true)}>
                            <Text style={styles.linkText}>+ Add Another</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {user?.addresses && user.addresses.length > 0 ? (
                        user.addresses.map((addr: any) => (
                            <TouchableOpacity 
                                key={addr._id} 
                                style={[styles.addressOption, selectedAddress?._id === addr._id && styles.selectedOption]}
                                onPress={() => setSelectedAddress(addr)}
                            >
                                <Ionicons 
                                    name={selectedAddress?._id === addr._id ? "radio-button-on" : "radio-button-off"} 
                                    size={20} 
                                    color={selectedAddress?._id === addr._id ? "#7C4DFF" : "#ccc"} 
                                />
                                <View style={{marginLeft: 10, flex: 1}}>
                                    <Text style={styles.addrMain}>{addr.street}</Text>
                                    <Text style={styles.addrSub}>{addr.city}, {addr.state} {addr.zipCode}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <TouchableOpacity style={styles.emptyAddrBtn} onPress={() => setShowNewAddrModal(true)}>
                            <Text style={{color: '#7C4DFF'}}>No addresses found. Click to add one.</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Mobile Number */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Contact Number</Text>
                    <TextInput 
                        style={styles.input} 
                        value={mobile} 
                        onChangeText={setMobile} 
                        keyboardType="phone-pad" 
                        placeholder="10-digit mobile number"
                    />
                </View>

                {/* Payment */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.paymentToggle}>
                        <TouchableOpacity 
                            style={[styles.payBtn, paymentMethod === 'COD' && styles.payBtnActive]} 
                            onPress={() => setPaymentMethod('COD')}
                        >
                            <Text style={[styles.payBtnText, paymentMethod === 'COD' && styles.payBtnTextActive]}>Cash on Delivery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.payBtn, paymentMethod === 'Online' && styles.payBtnActive]} 
                            onPress={() => setPaymentMethod('Online')}
                        >
                            <Text style={[styles.payBtnText, paymentMethod === 'Online' && styles.payBtnTextActive]}>Online Pay</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Final Total */}
                <View style={styles.totalCard}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.totalLabel}>Total Payable</Text>
                        <Text style={styles.totalVal}>₹{totalPrice}</Text>
                    </View>
                    <TouchableOpacity 
                        style={[styles.confirmBtn, (!selectedAddress || isProcessing) && {backgroundColor: '#ccc'}]} 
                        onPress={handleCheckout}
                        disabled={!selectedAddress || isProcessing}
                    >
                        {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirm Order</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Use Another Address Modal */}
            <Modal visible={showNewAddrModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBody}>
                        <Text style={styles.modalHeader}>Deliver to New Address</Text>
                        <TextInput placeholder="House No / Street" style={styles.input} onChangeText={t => setNewAddr({...newAddr, street: t})} />
                        <TextInput placeholder="City" style={styles.input} onChangeText={t => setNewAddr({...newAddr, city: t})} />
                        <View style={{flexDirection: 'row', gap: 10}}>
                            <TextInput placeholder="State" style={[styles.input, {flex: 1}]} onChangeText={t => setNewAddr({...newAddr, state: t})} />
                            <TextInput placeholder="Zip Code" style={[styles.input, {flex: 1}]} keyboardType="numeric" onChangeText={t => setNewAddr({...newAddr, zipCode: t})} />
                        </View>
                        <TouchableOpacity style={styles.modalActionBtn} onPress={handleAddNewAddress}>
                            <Text style={{color: '#fff', fontWeight: 'bold'}}>Save and Use Address</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{marginTop: 15, alignSelf: 'center'}} onPress={() => setShowNewAddrModal(false)}>
                            <Text style={{color: '#999'}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    emptyText: { fontSize: 18, color: '#999', marginTop: 15 },
    title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#1a1a1a' },
    sectionCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 3 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    itemImage: { width: 45, height: 45, borderRadius: 8, backgroundColor: '#f0f0f0' },
    itemName: { fontSize: 15, fontWeight: '500', color: '#333' },
    itemSub: { fontSize: 13, color: '#888', marginTop: 2 },
    linkText: { color: '#7C4DFF', fontWeight: 'bold', fontSize: 13 },
    addressOption: { flexDirection: 'row', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 8, alignItems: 'center' },
    selectedOption: { borderColor: '#7C4DFF', backgroundColor: '#F8F5FF' },
    addrMain: { fontWeight: '600', color: '#333', fontSize: 14 },
    addrSub: { fontSize: 12, color: '#777' },
    emptyAddrBtn: { padding: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#7C4DFF', borderRadius: 10, alignItems: 'center' },
    input: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 10 },
    paymentToggle: { flexDirection: 'row', gap: 10 },
    payBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
    payBtnActive: { backgroundColor: '#7C4DFF', borderColor: '#7C4DFF' },
    payBtnText: { color: '#666', fontWeight: '500' },
    payBtnTextActive: { color: '#fff', fontWeight: 'bold' },
    totalCard: { marginTop: 10, padding: 20, backgroundColor: '#fff', borderRadius: 20, elevation: 5 },
    totalLabel: { fontSize: 18, color: '#666' },
    totalVal: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
    confirmBtn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 15 },
    confirmText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    modalBody: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
    modalHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalActionBtn: { backgroundColor: '#7C4DFF', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 }
});

export default CartScreen;