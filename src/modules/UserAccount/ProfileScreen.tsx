import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import { useAuth } from '../../context/AuthContext'; 
import { pickImage, createFormData } from '../../utils/fileUtils';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const ProfileScreen: React.FC = () => {
    const { user, token, setUser, logout, axiosInstance } = useAuth();
    
    // State Management
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [expertise, setExpertise] = useState(user?.expertise?.join(', ') || '');
    const [imageUri, setImageUri] = useState(user?.profilePicture || 'https://via.placeholder.com/150');
    const [loading, setLoading] = useState(false);
    
    const isConsultant = user?.role === 'consultant';

    const handlePickImage = async () => {
        try {
            const uri = await pickImage();
            if (uri) {
                setImageUri(uri);
            }
        } catch (err) {
            Alert.alert('Error', 'Could not access image gallery.');
        }
    };

    const handleSave = async () => {
        if (!user || !token) {
            Alert.alert('Error', 'You must be logged in to update your profile.');
            return;
        }

        // Basic Validation
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Full Name is required.');
            return;
        }

        setLoading(true);
        try {
            // Determine if the image was actually changed
            const isImageChanged = imageUri !== user.profilePicture && !imageUri.startsWith('http');

            // Prepare the base data object
            const profileData: Record<string, any> = { 
                name,
                phone 
            };

            if (isConsultant) {
                profileData.bio = bio;
                profileData.expertise = expertise.split(',')
                    .map(e => e.trim())
                    .filter(e => e.length > 0);
            }

            let payload: any;
            let headers: Record<string, string> = {
                Authorization: `Bearer ${token}`
            };

            // Handle Multipart vs JSON
            if (isImageChanged) {
                payload = createFormData(imageUri, 'profilePicture', profileData);
                headers['Content-Type'] = 'multipart/form-data';
            } else {
                payload = profileData;
                headers['Content-Type'] = 'application/json';
            }
            
            // Use the axiosInstance from context for consistent base URL and config
            const response = await axiosInstance(token).put(
                `/users/${user._id}`, 
                payload, 
                { headers }
            );

            // Update global user state with the returned data
            const updatedUser = response.data.data || response.data;
            setUser(updatedUser);
            
            Alert.alert('Success', 'Your profile has been updated successfully.');
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
            console.error('Profile Update Error:', errorMessage);
            Alert.alert('Update Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                style={styles.flex}
            >
                <ScrollView 
                    contentContainerStyle={styles.container} 
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    
                    {/* Header Profile Section */}
                    <View style={styles.headerCard}>
                        <View style={styles.profileImageContainer}>
                            <Image 
                                source={{ uri: imageUri }} 
                                style={styles.profileImage} 
                                defaultSource={{ uri: 'https://via.placeholder.com/150' }}
                            />
                            <TouchableOpacity 
                                style={styles.cameraIcon} 
                                onPress={handlePickImage} 
                                disabled={loading}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="camera" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
                        <Text style={styles.userRole}>
                            {isConsultant ? 'Veterinarian Consultant' : 'Pet Owner'}
                        </Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        <Text style={styles.sectionTitle}>Account Details</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput 
                                style={styles.input} 
                                value={name} 
                                onChangeText={setName} 
                                placeholder="Enter your full name"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput 
                                style={styles.input} 
                                value={phone} 
                                onChangeText={setPhone} 
                                placeholder="+1 (555) 000-0000"
                                keyboardType="phone-pad"
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
                            <Text style={styles.helperText}>Email cannot be changed.</Text>
                        </View>

                        {isConsultant && (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Expertise / Skills</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        value={expertise} 
                                        onChangeText={setExpertise} 
                                        placeholder="Dogs, Surgery, Nutrition..."
                                        placeholderTextColor="#999"
                                    />
                                    <Text style={styles.helperText}>Comma separated list</Text>
                                </View>
                                
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Professional Bio</Text>
                                    <TextInput 
                                        style={[styles.input, styles.textArea]} 
                                        value={bio} 
                                        onChangeText={setBio} 
                                        multiline 
                                        numberOfLines={4}
                                        placeholder="Briefly describe your experience and background..."
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </>
                        )}

                        <TouchableOpacity 
                            style={[styles.saveButton, loading && styles.disabledButton]} 
                            onPress={handleSave} 
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Update Profile</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.logoutButton} 
                            onPress={logout} 
                            disabled={loading}
                        >
                            <Ionicons name="log-out-outline" size={20} color="#FF3B30" style={{marginRight: 8}} />
                            <Text style={styles.logoutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1, 
        backgroundColor: '#f8f9fa'
    },
    flex: {
        flex: 1
    },
    container: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    headerCard: {
        backgroundColor: '#fff',
        paddingVertical: 35,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        marginBottom: 10,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#eee',
        borderWidth: 4,
        borderColor: '#fff',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#7C4DFF',
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    userRole: {
        fontSize: 13,
        color: '#7C4DFF',
        fontWeight: '700',
        backgroundColor: '#F0EBFF',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        overflow: 'hidden',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    formContainer: {
        paddingHorizontal: 24,
        marginTop: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 22,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
        marginLeft: 2,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
        paddingTop: 14,
    },
    disabledInput: {
        backgroundColor: '#f1f1f1',
        color: '#888',
        borderColor: '#e0e0e0',
    },
    helperText: {
        fontSize: 12,
        color: '#999',
        marginTop: 6,
        marginLeft: 4,
    },
    saveButton: {
        backgroundColor: '#7C4DFF',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#7C4DFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    disabledButton: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 17,
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        marginTop: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFD1D1',
        backgroundColor: '#FFF5F5',
    },
    logoutText: {
        color: '#FF3B30',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default ProfileScreen;