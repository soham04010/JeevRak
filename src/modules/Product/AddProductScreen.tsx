import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Use this for better compatibility
import { useAuth } from '../../context/AuthContext';
import { pickImage } from '@utils/fileUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AddProductScreen: React.FC<any> = ({ navigation }) => {
    const { token, axiosInstance } = useAuth();
    
    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [brand, setBrand] = useState('');
    const [countInStock, setCountInStock] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [sellerAddress, setSellerAddress] = useState('');
    const [sellerContact, setSellerContact] = useState('');
    const [sellerEmail, setSellerEmail] = useState('');

    // Image State
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const handlePickImage = async () => {
        if (images.length >= 8) {
            return Alert.alert('Limit Reached', 'You can only add up to 8 images.');
        }
        const uri = await pickImage();
        if (uri) setImages([...images, uri]);
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleCreate = async () => {
        if (!name || !price || images.length === 0) {
            return Alert.alert('Missing Info', 'Please provide a Name, Price, and at least one Image.');
        }

        setUploading(true);

        try {
            const formData = new FormData();
            
            // 1. Process Images for Android
            images.forEach((uri, index) => {
                const filename = uri.split('/').pop() || `image_${index}.jpg`;
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                
                // CRITICAL: Ensure URI is correctly formatted for the React Native bridge
                const cleanUri = Platform.OS === 'android' ? uri : uri.replace('file://', '');

                formData.append('images', {
                    uri: cleanUri,
                    name: filename,
                    type: type,
                } as any);
            });

            // 2. Append text fields (STRICTLY CONVERT TO STRINGS)
            formData.append('name', String(name));
            formData.append('price', String(price));
            formData.append('brand', String(brand));
            formData.append('category', String(category));
            formData.append('countInStock', String(countInStock));
            formData.append('description', String(description));
            formData.append('sellerAddress', String(sellerAddress));
            formData.append('sellerContact', String(sellerContact));
            formData.append('sellerEmail', String(sellerEmail));

            // 3. Network Request
            const baseURL = axiosInstance(token!).defaults.baseURL;
            const url = `${baseURL}/products`;

            console.log('Final Uploading to:', url);

            // Fetch is more stable for binary uploads on Android
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    // Content-Type must NOT be set manually here
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Server rejected the request');
            }

            Alert.alert('Success', 'Product added successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error: any) {
            console.error('Add Product Fatal Error:', error);
            Alert.alert('Upload Error', error.message || 'Check your internet and try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
                <ScrollView contentContainerStyle={styles.container}>
                    
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Add New Product</Text>
                        <View style={{width: 24}} />
                    </View>

                    <Text style={styles.sectionTitle}>Product Images ({images.length}/8)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
                        <TouchableOpacity onPress={handlePickImage} style={styles.addImgBtn}>
                            <Ionicons name="camera-outline" size={32} color="#7C4DFF" />
                            <Text style={styles.addImgText}>Add</Text>
                        </TouchableOpacity>
                        {images.map((uri, index) => (
                            <View key={index} style={styles.imageContainer}>
                                <Image source={{ uri }} style={styles.previewImage} />
                                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>

                    <Text style={styles.sectionTitle}>Basic Details</Text>
                    <TextInput style={styles.input} placeholder="Product Name" value={name} onChangeText={setName} placeholderTextColor="#999" />
                    
                    <View style={styles.row}>
                        <View style={{flex: 1, marginRight: 10}}>
                            <TextInput style={styles.input} placeholder="Price (₹)" value={price} onChangeText={setPrice} keyboardType="numeric" placeholderTextColor="#999" />
                        </View>
                        <View style={{flex: 1}}>
                            <TextInput style={styles.input} placeholder="Stock Qty" value={countInStock} onChangeText={setCountInStock} keyboardType="numeric" placeholderTextColor="#999" />
                        </View>
                    </View>

                    <TextInput style={styles.input} placeholder="Brand" value={brand} onChangeText={setBrand} placeholderTextColor="#999" />
                    <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} placeholderTextColor="#999" />
                    <TextInput style={[styles.input, styles.textArea]} placeholder="Description" value={description} onChangeText={setDescription} multiline placeholderTextColor="#999" />

                    <Text style={styles.sectionTitle}>Seller Information</Text>
                    <TextInput style={styles.input} placeholder="Address" value={sellerAddress} onChangeText={setSellerAddress} placeholderTextColor="#999" />
                    <TextInput style={styles.input} placeholder="Contact" value={sellerContact} onChangeText={setSellerContact} keyboardType="phone-pad" placeholderTextColor="#999" />
                    <TextInput style={styles.input} placeholder="Email" value={sellerEmail} onChangeText={setSellerEmail} keyboardType="email-address" placeholderTextColor="#999" />

                    <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={uploading}>
                        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Product</Text>}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#555', marginVertical: 10 },
    carousel: { flexDirection: 'row', marginBottom: 20 },
    addImgBtn: { width: 100, height: 100, backgroundColor: '#eee', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
    addImgText: { color: '#7C4DFF', fontSize: 12, marginTop: 4 },
    imageContainer: { marginRight: 10, position: 'relative' },
    previewImage: { width: 100, height: 100, borderRadius: 10 },
    removeBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: '#fff', borderRadius: 12 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 16, color: '#000' },
    row: { flexDirection: 'row' },
    textArea: { height: 80, textAlignVertical: 'top' },
    btn: { backgroundColor: '#7C4DFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});

export default AddProductScreen;