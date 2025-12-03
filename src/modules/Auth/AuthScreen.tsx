import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView 
} from 'react-native';
import { useAuth } from '../../context/AuthContext'; 

const AuthScreen: React.FC = () => {
    // Access the global auth functions
    const { login, register } = useAuth(); 
    
    // State for toggling views
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState<'user' | 'consultant'>('user');
    
    // Form Fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [expertise, setExpertise] = useState('');
    const [bio, setBio] = useState('');
    
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        // 1. Basic Validation
        if (!email || !password) {
            return Alert.alert('Error', 'Email and password are required.');
        }
        
        setLoading(true);
        try {
            if (isLogin) {
                // 2. Handle Login
                await login(email, password);
            } else {
                // 3. Handle Sign Up
                if (!name || (role === 'consultant' && (!expertise || !bio))) {
                    return Alert.alert('Error', 'Please fill all required fields.');
                }
                
                // Prepare data for backend (matches User.js model)
                const formData = {
                    name, 
                    email, 
                    password, 
                    role,
                    // Convert comma string to array for backend
                    expertise: role === 'consultant' ? expertise.split(',').map(e => e.trim()).filter(e => e) : undefined,
                    bio: role === 'consultant' ? bio : undefined
                };
                
                // Send to database
                await register(formData);
            }
        } catch (error: any) {
            // Show error from backend (e.g., "Email already exists")
            Alert.alert('Authentication Failed', error.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                style={{flex: 1}}
            >
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    
                    {/* Header */}
                    <Text style={styles.title}>JeevRak</Text>
                    <Text style={styles.subtitle}>
                        {isLogin ? 'Welcome Back, Guardian!' : 'Join our Community'}
                    </Text>

                    {/* Role Selector (Only visible during Sign Up) */}
                    {!isLogin && (
                        <View style={styles.roleContainer}>
                            <TouchableOpacity 
                                style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]} 
                                onPress={() => setRole('user')}
                            >
                                <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>
                                    Pet Owner
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.roleBtn, role === 'consultant' && styles.roleBtnActive]} 
                                onPress={() => setRole('consultant')}
                            >
                                <Text style={[styles.roleText, role === 'consultant' && styles.roleTextActive]}>
                                    Doctor (Vet)
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Inputs */}
                    {!isLogin && (
                        <TextInput 
                            style={styles.input} 
                            placeholder="Full Name" 
                            placeholderTextColor="#888" 
                            value={name} 
                            onChangeText={setName} 
                        />
                    )}
                    
                    <TextInput 
                        style={styles.input} 
                        placeholder="Email Address" 
                        placeholderTextColor="#888" 
                        value={email} 
                        onChangeText={setEmail} 
                        autoCapitalize="none" 
                        keyboardType="email-address"
                    />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Password" 
                        placeholderTextColor="#888" 
                        value={password} 
                        onChangeText={setPassword} 
                        secureTextEntry 
                    />

                    {/* Consultant Specific Fields */}
                    {!isLogin && role === 'consultant' && (
                        <>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Expertise (e.g. Dogs, Surgery)" 
                                placeholderTextColor="#888" 
                                value={expertise} 
                                onChangeText={setExpertise} 
                            />
                            <TextInput 
                                style={[styles.input, styles.bioInput]} 
                                placeholder="Short Bio (Tell us about your experience)" 
                                placeholderTextColor="#888" 
                                value={bio} 
                                onChangeText={setBio} 
                                multiline 
                                textAlignVertical='top'
                            />
                        </>
                    )}

                    {/* Action Button */}
                    <TouchableOpacity style={styles.mainBtn} onPress={handleAuth} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff"/> 
                        ) : (
                            <Text style={styles.mainBtnText}>
                                {isLogin ? 'Log In' : 'Create Account'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Toggle Mode */}
                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchBtn}>
                        <Text style={styles.switchText}>
                            {isLogin ? "New here? Create an Account" : "Already have an account? Log In"}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flexGrow: 1, 
        justifyContent: 'center', 
        padding: 25, 
        backgroundColor: '#F7F4FA' 
    },
    title: { 
        fontSize: 32, 
        fontWeight: 'bold', 
        color: '#7C4DFF', 
        textAlign: 'center', 
        marginBottom: 5 
    },
    subtitle: { 
        fontSize: 16, 
        color: '#555', 
        textAlign: 'center', 
        marginBottom: 30 
    },
    roleContainer: { 
        flexDirection: 'row', 
        marginBottom: 20, 
        backgroundColor: '#E0E0E0', 
        borderRadius: 10, 
        padding: 4 
    },
    roleBtn: { 
        flex: 1, 
        padding: 12, 
        borderRadius: 8, 
        alignItems: 'center' 
    },
    roleBtnActive: { 
        backgroundColor: '#fff', 
        elevation: 2 
    },
    roleText: { 
        color: '#666', 
        fontWeight: '600' 
    },
    roleTextActive: { 
        color: '#7C4DFF', 
        fontWeight: 'bold' 
    },
    input: { 
        backgroundColor: '#fff', 
        borderRadius: 10, 
        padding: 15, 
        marginBottom: 15, 
        fontSize: 16, 
        color: '#000000', // Forces black text
        borderWidth: 1, 
        borderColor: '#E0E0E0' 
    },
    bioInput: { 
        height: 100 
    },
    mainBtn: { 
        backgroundColor: '#7C4DFF', 
        padding: 15, 
        borderRadius: 10, 
        alignItems: 'center', 
        marginTop: 10, 
        elevation: 3 
    },
    mainBtnText: { 
        color: '#fff', 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    switchBtn: { 
        marginTop: 20, 
        alignItems: 'center',
        padding: 10
    },
    switchText: { 
        color: '#7C4DFF', 
        fontSize: 15,
        fontWeight: '500'
    },
});

export default AuthScreen;