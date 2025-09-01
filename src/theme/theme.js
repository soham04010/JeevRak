import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

// This file centralizes your app's color scheme for consistency across all screens.
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2E7D32', // A deep, trustworthy green representing life and nature.
    secondary: '#FFC107',   // A warm, friendly accent color for buttons and highlights.
    background: '#F5F5F5', // A slightly off-white background for a clean, soft look.
    surface: '#FFFFFF',    // Pure white for cards and other surfaces to make them pop.
    text: '#212121',     // A dark grey for text, which is easier on the eyes than pure black.
    error: '#B00020',      // A standard error color.
    onSurface: '#212121', // Ensures text on white surfaces is dark.
  },
};

