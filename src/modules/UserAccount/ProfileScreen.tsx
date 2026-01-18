import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, Modal
} from 'react-native';
import { useAuth } from '../../context/AuthContext'; 
import { pickImage, createFormData } from '../../utils/fileUtils';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const ProfileScreen: React.FC = () => {
    const { user, token, setUser, logout, axiosInstance } = useAuth();
    
    const [name, setName] = useState(user?.name || '');
    const [mobile, setMobile] = useState(user?.mobile || ''); 
    const [bio, setBio] = useState(user?.bio || '');
    const [expertise, setExpertise] = useState(user?.expertise?.join(', ') || '');
    const [imageUri, setImageUri] = useState(user?.profilePicture || 'https://via.placeholder.com/150');
    const [loading, setLoading] = useState(false);
    
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddr, setNewAddr] = useState({ street: '', city: '', state: '', zipCode: '' });
    const [addrErrors, setAddrErrors] = useState({ street: false, city: false, state: false, zipCode: false });

    const isConsultant = user?.role === 'consultant';

    const handlePickImage = async () => {
        try {
            const uri = await pickImage();
            if (uri) setImageUri(uri);
        } catch (err) {
            Alert.alert('Error', 'Could not access image gallery.');
        }
    };

    const handleSaveProfile = async () => {
        if (!user || !token) return;
        if (!name.trim() || !mobile.trim()) {
            Alert.alert('Error', 'Name and Mobile are required.');
            return;
        }

        setLoading(true);
        try {
            const isImageChanged = imageUri !== user.profilePicture && !imageUri.startsWith('http');
            const profileData: any = { name, mobile, bio };
            
            if (isConsultant) {
                profileData.expertise = expertise.split(',').map(e => e.trim()).filter(e => e.length > 0);
            }

            let payload;
            let headers: any = { Authorization: `Bearer ${token}` };

            if (isImageChanged) {
                payload = createFormData(imageUri, 'profilePicture', profileData);
                headers['Content-Type'] = 'multipart/form-data';
            } else {
                payload = profileData;
                headers['Content-Type'] = 'application/json';
            }
            
            const response = await axiosInstance(token).put(`/users/${user._id}`, payload, { headers });
            setUser(response.data.data);
            Alert.alert('Success', 'Profile updated.');
        } catch (error: any) {
            Alert.alert('Update Failed', error.response?.data?.error || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const validateAddress = () => {
        const cleanZip = newAddr.zipCode.trim().replace(/\s/g, "");
        const errors = {
            street: !newAddr.street.trim(),
            city: !newAddr.city.trim(),
            state: !newAddr.state.trim(),
            zipCode: !/^[1-9][0-9]{5}$/.test(cleanZip)
        };

        setAddrErrors(errors);

        if (errors.street || errors.city || errors.state) {
            Alert.alert('Error', 'Please fill in all the required address fields.');
            return false;
        }
        if (errors.zipCode) {
            Alert.alert('Invalid ZIP', 'Please enter a valid 6-digit Indian PIN code.');
            return false;
        }

        return true;
    };

    const handleAddAddress = async () => {
        if (!validateAddress()) return;
        
        setLoading(true);
        try {
            const cleanedAddr = {
                street: newAddr.street.trim(),
                city: newAddr.city.trim(),
                state: newAddr.state.trim(),
                zipCode: newAddr.zipCode.trim().replace(/\s/g, "")
            };

            const response = await axiosInstance(token!).post('/users/address', cleanedAddr);
            setUser({ ...user, addresses: response.data.data });
            setShowAddressModal(false);
            setNewAddr({ street: '', city: '', state: '', zipCode: '' });
            setAddrErrors({ street: false, city: false, state: false, zipCode: false });
            Alert.alert('Success', 'Address added successfully.');
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Failed to add address';
            Alert.alert('Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = (addressId: string) => {
        Alert.alert('Delete', 'Remove this address?', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Delete', 
                style: 'destructive', 
                onPress: async () => {
                    try {
                        const response = await axiosInstance(token!).delete(`/users/address/${addressId}`);
                        setUser({ ...user, addresses: response.data.data });
                    } catch (e) {
                        Alert.alert('Error', 'Could not delete address');
                    }
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
                <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                    <View style={styles.headerCard}>
                        <View style={styles.profileImageContainer}>
                            <Image source={{ uri: imageUri }} style={styles.profileImage} />
                            <TouchableOpacity style={styles.cameraIcon} onPress={handlePickImage}>
                                <Ionicons name="camera" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput style={styles.input} value={name} onChangeText={setName} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mobile Number</Text>
                            <TextInput style={styles.input} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
                        </View>

                        {isConsultant && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Bio</Text>
                                <TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} multiline />
                            </View>
                        )}

                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Profile Changes</Text>}
                        </TouchableOpacity>

                        <View style={styles.addressSection}>
                            <View style={styles.row}>
                                <Text style={styles.sectionTitle}>My Saved Addresses</Text>
                                <TouchableOpacity onPress={() => setShowAddressModal(true)}>
                                    <Ionicons name="add-circle" size={28} color="#7C4DFF" />
                                </TouchableOpacity>
                            </View>

                            {user?.addresses && user.addresses.length > 0 ? (
                                user.addresses.map((addr: any) => (
                                    <View key={addr._id} style={styles.addressItem}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.addrText}>{addr.street}</Text>
                                            <Text style={styles.cityText}>{addr.city}, {addr.state} - {addr.zipCode}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleDeleteAddress(addr._id)}>
                                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.helperText}>No addresses saved yet.</Text>
                            )}
                        </View>

                        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                            <Ionicons name="log-out-outline" size={20} color="#FF3B30" style={{marginRight: 8}} />
                            <Text style={styles.logoutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal visible={showAddressModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Address</Text>
                        <TextInput 
                            placeholder="Street / Area / Landmark" 
                            style={[styles.input, addrErrors.street && styles.inputError]} 
                            value={newAddr.street}
                            onChangeText={t => setNewAddr({...newAddr, street: t})} 
                        />
                        <TextInput 
                            placeholder="City / Town" 
                            style={[styles.input, addrErrors.city && styles.inputError]} 
                            value={newAddr.city}
                            onChangeText={t => setNewAddr({...newAddr, city: t})} 
                        />
                        <View style={styles.row}>
                            <TextInput 
                                placeholder="State" 
                                style={[styles.input, {flex: 1, marginRight: 10}, addrErrors.state && styles.inputError]} 
                                value={newAddr.state}
                                onChangeText={t => setNewAddr({...newAddr, state: t})} 
                            />
                            <TextInput 
                                placeholder="6-digit PIN" 
                                style={[styles.input, {flex: 1}, addrErrors.zipCode && styles.inputError]} 
                                value={newAddr.zipCode}
                                onChangeText={t => setNewAddr({...newAddr, zipCode: t.replace(/[^0-9]/g, '')})} 
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                        </View>
                        <TouchableOpacity style={styles.saveButton} onPress={handleAddAddress} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Add Address</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={{marginTop: 15, alignItems: 'center'}} onPress={() => setShowAddressModal(false)}>
                            <Text style={{color: '#666', fontWeight: '600'}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
    flex: { flex: 1 },
    container: { paddingBottom: 40 },
    headerCard: { backgroundColor: '#fff', paddingVertical: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 3 },
    profileImageContainer: { position: 'relative', marginBottom: 10 },
    profileImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee' },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#7C4DFF', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    userName: { fontSize: 22, fontWeight: '700', color: '#333' },
    userRole: { fontSize: 12, color: '#7C4DFF', fontWeight: 'bold', marginTop: 5 },
    formContainer: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 14, color: '#666', marginBottom: 5 },
    input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#ddd', marginBottom: 10, color: '#333' },
    inputError: { borderColor: '#FF3B30', backgroundColor: '#FFF5F5' },
    textArea: { height: 80, textAlignVertical: 'top' },
    saveButton: { backgroundColor: '#7C4DFF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    addressSection: { marginTop: 30, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    addressItem: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
    addrText: { fontWeight: '600', color: '#333' },
    cityText: { fontSize: 13, color: '#888' },
    helperText: { color: '#999', fontStyle: 'italic' },
    logoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, marginTop: 30 },
    logoutText: { color: '#FF3B30', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' }
});

export default ProfileScreen;