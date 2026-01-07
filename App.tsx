import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext'; // Ensure this matches the file above
import RootNavigator from './src/navigation/RootNavigator';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider> 
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;