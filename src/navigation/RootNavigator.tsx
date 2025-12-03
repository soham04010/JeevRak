import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext'; // Access the token

// Import Screens using aliases (easier to read)
import AuthScreen from '@modules/Auth/AuthScreen';
import ChatScreen from '@modules/Consultant/ChatScreen';
import InboxScreen from '@modules/Consultant/InboxScreen';
import MainNavigator from '@components/navigation/MainNavigator';

const Stack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
  const { token, isLoading } = useAuth();

  // 1. While checking if user is logged in, show loading screen
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
            // 2. IF LOGGED IN: Show the Main App
            <>
                <Stack.Screen name="MainTabs" component={MainNavigator} />
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="Inbox" component={InboxScreen} /> 
            </>
        ) : (
            // 3. IF NOT LOGGED IN: Show the Auth Screen (Login/Signup)
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