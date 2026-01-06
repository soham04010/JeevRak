import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext'; 

// Import Screens
import AuthScreen from '@modules/Auth/AuthScreen';
import ChatScreen from '@modules/Consultant/ChatScreen';
import InboxScreen from '@modules/Consultant/InboxScreen';
import MainNavigator from '@components/navigation/MainNavigator';

// Missing Product Related Screens
import AddProductScreen from '@modules/Product/AddProductScreen';
import CartScreen from '@modules/Product/CartScreen';
import ProductDetailScreen from '@modules/Product/ProductDetailScreen';

const Stack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
        <SafeAreaView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C4DFF" />
            <Text style={styles.loadingText}>Loading JeevRak...</Text>
        </SafeAreaView>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
            <>
                <Stack.Screen name="MainTabs" component={MainNavigator} />
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="Inbox" component={InboxScreen} /> 
                
                {/* REGISTER MISSING SCREENS HERE */}
                <Stack.Screen name="AddProduct" component={AddProductScreen} />
                <Stack.Screen name="Cart" component={CartScreen} />
                <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            </>
        ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
        )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#F7F4FA' 
    },
    loadingText: { 
        marginTop: 10, 
        color: '#7C4DFF', 
        fontSize: 16, 
        fontWeight: '600' 
    }
});

export default RootNavigator;