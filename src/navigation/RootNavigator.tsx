import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

// Import Screens using relative paths to ensure resolution
import AuthScreen from '../modules/Auth/AuthScreen';
import ChatScreen from '../modules/Consultant/ChatScreen';
import InboxScreen from '../modules/Consultant/InboxScreen';
import MainNavigator from '../components/navigation/MainNavigator';

// Product and E-commerce Screens
import AddProductScreen from '../modules/Product/AddProductScreen';
import CartScreen from '../modules/Product/CartScreen';
import ProductDetailScreen from '../modules/Product/ProductDetailScreen';
import ChatBotScreen from '../screens/ChatBotScreen';

const Stack = createNativeStackNavigator();

/**
 * RootNavigator manages the high-level navigation flow of JeevRak.
 * It handles the conditional rendering between Auth and Main application stacks.
 */
const RootNavigator: React.FC = () => {
    const { token, isLoading } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C4DFF" />
                <Text style={styles.loadingText}>Loading JeevRak...</Text>
            </SafeAreaView>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right' // Amazon/Flipkart style smooth transitions
            }}
        >
            {token ? (
                // Authenticated Stack
                <>
                    <Stack.Screen name="MainTabs" component={MainNavigator} />

                    {/* Product & Shopping Flow */}
                    <Stack.Screen
                        name="ProductDetail"
                        component={ProductDetailScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Cart"
                        component={CartScreen}
                        options={{
                            headerShown: true,
                            title: 'Shopping Cart',
                            headerTintColor: '#7C4DFF'
                        }}
                    />

                    {/* Admin/Consultant Exclusive */}
                    <Stack.Screen name="AddProduct" component={AddProductScreen} />

                    {/* Communication */}
                    <Stack.Screen name="Chat" component={ChatScreen} />
                    <Stack.Screen name="Inbox" component={InboxScreen} />
                    <Stack.Screen name="ChatBot" component={ChatBotScreen} />
                </>
            ) : (
                // Unauthenticated Stack
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