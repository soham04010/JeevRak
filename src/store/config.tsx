import { Platform } from "react-native";

export const BaseURL = Platform.OS === 'android' ?
 'http://10.0.2.2:3000' : 'http://localhost:3000';


 // USE YOUR NETWORK IP OR HOST IP FOR REAL DEVICE TESTING
 //FOR PHYSICAL DEVICE    
0// export const BaseURL2 = 'https://192.168.1.1:3000';