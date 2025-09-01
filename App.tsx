import React from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { theme } from './src/theme/theme';
import BottomNavigator from './src/components/BottomNavigator';

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
        <BottomNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
