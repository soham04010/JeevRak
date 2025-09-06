import { Dimensions } from "react-native";

export const screenHeight = Dimensions.get('screen').height
export const screenWidth = Dimensions.get('screen').width

export enum FONTS {
  heading = "CormorantGaramond-Medium",
  heading2 = "CormorantGaramond-Regular",
}

export enum Colors {
  primary = '#FFC201',
  active = '#1054E8',
  inactive = '#666',
  lightText = "#222",
  background = '#fff',
  text = '#222',
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
};

