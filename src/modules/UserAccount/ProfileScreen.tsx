import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import axios from 'axios'; // <--- ADDED THIS IMPORT
// Check this path matches where your AuthContext is located
import { useAuth } from '../../context/AuthContext'; 
import { pickImage, createFormData } from '../../utils/fileUtils';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const ProfileScreen: React.FC = () => {
    const { user, token, setUser, logout, axiosInstance } = useAuth();
    
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [expertise, setExpertise] = useState(user?.expertise?.join(', ') || '');
    const [imageUri, setImageUri] = useState(user?.profilePicture || 'default-user');
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
                data.expertise = expertise.split(',').map(e => e.trim()).filter(e => e);
            }

            let requestConfig = {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            };
            let payload: any = data;

            // If updating image, use FormData and multipart headers
            if (isImageChanged) {
                payload = createFormData(imageUri, 'profilePicture', data);
                requestConfig.headers['Content-Type'] = 'multipart/form-data';
            }
            
            // Get base URL from the context's axios instance
            const baseURL = axiosInstance(token).defaults.baseURL;
            
            // Perform the PUT request
            const res = await axios.put(`${baseURL}/users/${user._id}`, payload, requestConfig);

            // Update global user state
            setUser(res.data.data);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error: any) {
            console.error('Profile Update Error:', error.response?.data?.error || error.message);
            Alert.alert('Error', error.response?.data?.error || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f5f5f5'}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    
                    {/* Header Profile Section */}
                    <View style={styles.headerCard}>
                        <View style={styles.profileImageContainer}>
                            <Image source={{ uri: imageUri }} style={styles.profileImage} />
                            <TouchableOpacity style={styles.cameraIcon} onPress={handlePickImage} disabled={loading}>
                                <Ionicons name="camera" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.userRole}>{isConsultant ? 'Veterinarian Consultant' : 'Pet Owner'}</Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput 
                                style={styles.input} 
                                value={name} 
                                onChangeText={setName} 
                                placeholder="Enter your name"
                                placeholderTextColor="#999"
                            />
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput 
                                style={[styles.input, styles.disabledInput]} 
                                value={user?.email} 
                                editable={false} 
                            />
                        </View>

                        {isConsultant && (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Expertise</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        value={expertise} 
                                        onChangeText={setExpertise} 
                                        placeholder="e.g. Dogs, Surgery, Diet"
                                        placeholderTextColor="#999"
                                    />
                                    <Text style={styles.helperText}>Separate multiple skills with commas</Text>
                                </View>
                                
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Bio</Text>
                                    <TextInput 
                                        style={[styles.input, styles.textArea]} 
                                        value={bio} 
                                        onChangeText={setBio} 
                                        multiline 
                                        placeholder="Tell us about yourself..."
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </>
                        )}

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.logoutButton} onPress={logout} disabled={loading}>
                            <Ionicons name="log-out-outline" size={20} color="#FF3B30" style={{marginRight: 8}} />
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    headerCard: {
        backgroundColor: '#fff',
        paddingVertical: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 20,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#E0E0E0',
        borderWidth: 4,
        borderColor: '#f0f0f0',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#7C4DFF',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: '#7C4DFF',
        fontWeight: '600',
        backgroundColor: '#EDE7F6',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    formContainer: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        color: '#999',
        borderColor: '#eee',
        elevation: 0,
    },
    helperText: {
        fontSize: 12,
        color: '#999',
        marginTop: 6,
        marginLeft: 4,
    },
    saveButton: {
        backgroundColor: '#7C4DFF',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
        shadowColor: '#7C4DFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    saveButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        marginTop: 15,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#FFCDD2',
        backgroundColor: '#FFEBEE',
    },
    logoutText: {
        color: '#FF3B30',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default ProfileScreen;