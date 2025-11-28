import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import axios from 'axios'; 
import { useAuth } from '../../context/AuthContext'; // Use relative path for robustness
import { pickImage, createFormData } from '@utils/fileUtils'; // Use Alias

const ProfileScreen: React.FC = () => {
    const { user, token, setUser, logout, axiosInstance } = useAuth();
    
    // Initialize state with current user data
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [expertise, setExpertise] = useState(user?.expertise?.join(', ') || '');
    const [imageUri, setImageUri] = useState(user?.profilePicture || 'https://placehold.co/400x400/CCCCCC/000000?text=Profile');
    const [loading, setLoading] = useState(false);
    
    const isConsultant = user?.role === 'consultant';

    const handlePickImage = async () => {
        const uri = await pickImage();
        if (uri) {
            setImageUri(uri);
        }
    };

    const handleSave = async () => {
        if (!user || !token) return;

        setLoading(true);
        try {
            // Check if image is different from current and not the placeholder
            const isImageChanged = imageUri !== user.profilePicture && !imageUri.includes('placehold.co');

            const data: Record<string, any> = { name };
            if (isConsultant) {
                data.bio = bio;
                // Convert expertise string back to an array, filtering out empty entries
                data.expertise = expertise.split(',').map(e => e.trim()).filter(e => e); 
            }

            let requestConfig = {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    // This will be overwritten below if an image is uploaded
                    'Content-Type': 'application/json', 
                }
            };
            let payload: any = data;
            
            const baseURL = axiosInstance(token).defaults.baseURL;

            if (isImageChanged) {
                // If image changed, create multipart form data
                payload = createFormData(imageUri, 'profilePicture', data);
                requestConfig.headers['Content-Type'] = 'multipart/form-data';
            }
            
            // Perform the PUT request to the backend
            const res = await axios.put(`${baseURL}/users/${user._id}`, payload, requestConfig);

            // Update global user state with the new data (including new Cloudinary URL)
            await setUser(res.data.data);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error: any) {
            console.error('Profile Update Error:', error.response?.data?.error || error.message);
            Alert.alert('Error', error.response?.data?.error || 'Failed to update profile. Check backend logs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#F8F9FA'}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Text style={styles.header}>My Account</Text>
                    <Text style={styles.roleTag}>{isConsultant ? 'Veterinarian Consultant' : 'Pet Owner'}</Text>

                    <View style={styles.profileSection}>
                        <Image source={{ uri: imageUri }} style={styles.profileImage} />
                        <TouchableOpacity style={styles.imageButton} onPress={handlePickImage} disabled={loading}>
                            <Text style={styles.imageButtonText}>Change Photo</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Full Name</Text>
                    <TextInput 
                        style={styles.input} 
                        value={name} 
                        onChangeText={setName} 
                        placeholder="Enter your name"
                        placeholderTextColor="#999"
                    />
                    
                    <Text style={styles.label}>Email</Text>
                    <TextInput 
                        style={[styles.input, styles.disabledInput]} 
                        value={user?.email} 
                        editable={false} 
                    />

                    {isConsultant && (
                        <>
                            <Text style={styles.label}>Expertise (Comma separated)</Text>
                            <TextInput 
                                style={styles.input} 
                                value={expertise} 
                                onChangeText={setExpertise} 
                                placeholder="e.g. Dogs, Surgery, Diet"
                                placeholderTextColor="#999"
                            />
                            
                            <Text style={styles.label}>Bio</Text>
                            <TextInput 
                                style={[styles.input, styles.textArea]} 
                                value={bio} 
                                onChangeText={setBio} 
                                multiline 
                                placeholder="Tell us about yourself..."
                                placeholderTextColor="#999"
                            />
                        </>
                    )}

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Profile</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={logout} disabled={loading}>
                        <Text style={styles.saveButtonText}>Log Out</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: { flex: 1, backgroundColor: '#F8F9FA' },
    container: { padding: 20, paddingBottom: 40, flexGrow: 1 },
    header: { fontSize: 28, fontWeight: 'bold', color: '#7C4DFF', textAlign: 'center' },
    roleTag: { fontSize: 16, color: '#A1887F', textAlign: 'center', marginBottom: 20 },
    profileSection: { alignItems: 'center', marginBottom: 30 },
    profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 15, backgroundColor: '#E0E0E0', borderWidth: 3, borderColor: '#7C4DFF' },
    imageButton: { backgroundColor: '#FF6E40', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, elevation: 2 },
    imageButtonText: { color: '#ffffff', fontWeight: '600' },
    label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 15 },
    input: { height: 50, backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#E0E0E0', fontSize: 16, color: '#000000' },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
    disabledInput: { backgroundColor: '#EAEAEA', color: '#666' },
    saveButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 30, elevation: 3 },
    logoutButton: { backgroundColor: '#FF3B30', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 15, elevation: 3 },
    saveButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 }
});

export default ProfileScreen;