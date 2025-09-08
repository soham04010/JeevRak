import { Dimensions } from "react-native";

export const screenHeight = Dimensions.get('screen').height
export const screenWidth = Dimensions.get('screen').width

export enum FONTS {
  heading = "CormorantGaramond-Medium",
  heading2 = "CormorantGaramond-Regular",
}

export const Colors = {
  primary: '#2E7D32', // A deep, trustworthy green representing life and nature.
  secondary: '#FFC107',   // A warm, friendly accent color for buttons and highlights.
  background: '#F5F5F5', // A slightly off-white background for a clean, soft look.
  surface: '#FFFFFF',    // Pure white for cards and other surfaces to make them pop.
  text: '#212121',     // A dark grey for text, which is easier on the eyes than pure black.
  error: '#B00020',      // A standard error color.
  onSurface: '#212121', 
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
};

