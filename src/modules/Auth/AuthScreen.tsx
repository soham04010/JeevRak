import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    ActivityIndicator, 
    KeyboardAvoidingView, 
    Platform, 
    ScrollView, 
    SafeAreaView, 
    Modal 
} from 'react-native';
import { useAuth } from '../../context/AuthContext'; 
import axios from 'axios';

/**
 * AuthScreen - Handles Login and Sign Up with OTP verification.
 * Address fields have been removed as per request to keep signup simple.
 */
const AuthScreen: React.FC = () => {
    const { login, register } = useAuth(); 
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState<'user' | 'consultant'>('user');
    
    // Core Identity Fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');

    // Consultant Specific Fields
    const [expertise, setExpertise] = useState('');
    const [bio, setBio] = useState('');
    
    // OTP / UI State
    const [otpModal, setOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    // Validation Logic
    const validateInputs = () => {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        const mobileRegex = /^[6-9]\d{9}$/;
        // Strong Password: 8+ chars, 1 Upper, 1 Lower, 1 Number, 1 Special
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!emailRegex.test(email)) return "Please enter a valid email address.";
        
        if (isLogin) {
            if (!password) return "Password is required.";
            return null;
        }

        // Registration-only validations
        if (!name) return "Full Name is required.";
        if (!mobileRegex.test(mobile)) return "Enter a valid 10-digit mobile number starting with 6-9.";
        if (!passwordRegex.test(password)) {
            return "Password must be 8+ characters, including Uppercase, Lowercase, a Number, and a Special Character.";
        }
        
        if (role === 'consultant') {
            if (!expertise || !bio) return "Doctors must provide expertise and bio information.";
        }
        
        return null;
    };

    // Stage 1: Initial submission (Login or Request OTP)
    const handleAuth = async () => {
        const error = validateInputs();
        if (error) return Alert.alert('Validation Error', error);
        
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                // Request OTP for new registration
                const res = await axios.post('http://10.0.2.2:5000/api/auth/send-otp', { email });
                if (res.data.success) {
                    setOtpModal(true);
                }
            }
        } catch (error: any) {
            const msg = error.response?.data?.error || error.message || "Something went wrong";
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    // Stage 2: Final Registration (Verify OTP)
    const handleVerifyAndSignUp = async () => {
        if (otp.length !== 4) return Alert.alert('Error', 'Please enter the 4-digit code sent to your email.');
        
        setLoading(true);
        try {
            const formData = {
                name, 
                email, 
                password, 
                mobile, 
                role, 
                otp,
                // Address removed from signup payload
                expertise: role === 'consultant' ? expertise.split(',').map(e => e.trim()) : undefined,
                bio: role === 'consultant' ? bio : undefined
            };
            
            await register(formData);
            setOtpModal(false);
        } catch (error: any) {
            const msg = error.response?.data?.error || "OTP verification failed. Please try again.";
            Alert.alert('Verification Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    
                    <Text style={styles.title}>JeevRak</Text>
                    <Text style={styles.subtitle}>{isLogin ? 'Guardian Login' : 'Create Account'}</Text>

                    {/* Role Selector */}
                    {!isLogin && (
                        <View style={styles.roleContainer}>
                            <TouchableOpacity 
                                style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]} 
                                onPress={() => setRole('user')}
                            >
                                <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Pet Owner</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.roleBtn, role === 'consultant' && styles.roleBtnActive]} 
                                onPress={() => setRole('consultant')}
                            >
                                <Text style={[styles.roleText, role === 'consultant' && styles.roleTextActive]}>Doctor (Vet)</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Form Fields */}
                    {!isLogin && (
                        <TextInput 
                            style={styles.input} 
                            placeholder="Full Name" 
                            value={name} 
                            onChangeText={setName} 
                            placeholderTextColor="#888"
                        />
                    )}
                    
                    <TextInput 
                        style={styles.input} 
                        placeholder="Email Address" 
                        value={email} 
                        onChangeText={setEmail} 
                        autoCapitalize="none" 
                        keyboardType="email-address"
                        placeholderTextColor="#888"
                    />
                    
                    {!isLogin && (
                        <TextInput 
                            style={styles.input} 
                            placeholder="Mobile (10 digits)" 
                            value={mobile} 
                            onChangeText={setMobile} 
                            keyboardType="phone-pad" 
                            maxLength={10}
                            placeholderTextColor="#888"
                        />
                    )}
                    
                    <TextInput 
                        style={styles.input} 
                        placeholder="Password" 
                        value={password} 
                        onChangeText={setPassword} 
                        secureTextEntry 
                        placeholderTextColor="#888"
                    />

                    {!isLogin && role === 'consultant' && (
                        <>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Expertise (e.g. Surgery, Cats)" 
                                value={expertise} 
                                onChangeText={setExpertise} 
                                placeholderTextColor="#888"
                            />
                            <TextInput 
                                style={[styles.input, styles.bioInput]} 
                                placeholder="Brief Bio" 
                                value={bio} 
                                onChangeText={setBio} 
                                multiline 
                                textAlignVertical="top"
                                placeholderTextColor="#888"
                            />
                        </>
                    )}

                    {/* Action Button */}
                    <TouchableOpacity 
                        style={styles.mainBtn} 
                        onPress={handleAuth} 
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff"/> 
                        ) : (
                            <Text style={styles.mainBtnText}>
                                {isLogin ? 'Log In' : 'Send Verification Code'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Switch Mode */}
                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchBtn}>
                        <Text style={styles.switchText}>
                            {isLogin ? "New user? Create an Account" : "Already have an account? Back to Login"}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* OTP Modal */}
            <Modal visible={otpModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Verify Your Email</Text>
                        <Text style={styles.modalSub}>Code sent to {email}</Text>
                        
                        <TextInput 
                            style={styles.otpInput} 
                            placeholder="0000" 
                            keyboardType="numeric" 
                            maxLength={4} 
                            value={otp} 
                            onChangeText={setOtp} 
                            autoFocus
                        />
                        
                        <TouchableOpacity 
                            style={styles.mainBtn} 
                            onPress={handleVerifyAndSignUp}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Verify & Join</Text>}
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => setOtpModal(false)} style={styles.cancelBtn}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    keyboardView: { flex: 1 },
    container: { flexGrow: 1, padding: 25, backgroundColor: '#F7F4FA', justifyContent: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#7C4DFF', textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20, marginTop: 5 },
    roleContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#E0E0E0', borderRadius: 10, padding: 4 },
    roleBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    roleBtnActive: { backgroundColor: '#fff', elevation: 2 },
    roleText: { color: '#666', fontWeight: '600' },
    roleTextActive: { color: '#7C4DFF', fontWeight: 'bold' },
    input: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16, color: '#000', borderWidth: 1, borderColor: '#E0E0E0' },
    bioInput: { height: 100 },
    mainBtn: { backgroundColor: '#7C4DFF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, elevation: 3, width: '100%' },
    mainBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    switchBtn: { marginTop: 20, alignItems: 'center', padding: 10 },
    switchText: { color: '#7C4DFF', fontSize: 15, fontWeight: '500' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: '#FFF', padding: 30, borderRadius: 24, alignItems: 'center' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    modalSub: { textAlign: 'center', color: '#666', marginVertical: 12 },
    otpInput: { fontSize: 32, letterSpacing: 12, borderBottomWidth: 2, borderBottomColor: '#7C4DFF', width: '60%', textAlign: 'center', marginBottom: 25, color: '#000', fontWeight: 'bold' },
    cancelBtn: { marginTop: 15, padding: 10 },
    cancelText: { color: '#FF5252', fontWeight: '600' }
});

export default AuthScreen;