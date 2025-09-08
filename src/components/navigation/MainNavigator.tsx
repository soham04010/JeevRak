import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';

// Import all your screens
import Home from '@modules/Home';
import Product from '@modules/Product';
import Map from '@modules/Map';
import Consultant from '@modules/Consultant';
import UserAccount from '@modules/UserAccount';

const Tab = createBottomTabNavigator();

const BottomNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: theme.colors.surface },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={Product}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shopping-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={Map}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Consultants"
        component={Consultant}
        options={{
          tabBarLabel: 'Consult',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="stethoscope" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={UserAccount}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomNavigator;
