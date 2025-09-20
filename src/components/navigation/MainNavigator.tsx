// src/components/navigation/MainNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "react-native-paper";

// Top-level modules (relative to src/components/navigation)
import Home from "../../modules/Home";
import Product from "../../modules/Product";
import Map from "../../modules/Map";
import Consultant from "../../modules/Consultant";

// Account area
import Account from "../../modules/UserAccount/Account";
import EditProfile from "../../modules/UserAccount/EditProfile";
import Settings from "../../modules/UserAccount/User-setting/Settings";
import ChangePassword from "../../modules/UserAccount/ChangePassword";
import Support from "../../modules/UserAccount/Support";

// Settings subpages
import Language from "../../modules/UserAccount/User-setting/Language";
import Notifications from "../../modules/UserAccount/User-setting/Notifications";

const Tab = createBottomTabNavigator();
const AccountStack = createNativeStackNavigator();

function AccountNavigator() {
  return (
    <AccountStack.Navigator>
      <AccountStack.Screen name="AccountHome" component={Account} options={{ headerShown: false }} />
      <AccountStack.Screen name="EditProfile" component={EditProfile} options={{ title: "Edit Profile" }} />
      <AccountStack.Screen name="Settings" component={Settings} options={{ title: "Settings" }} />
      <AccountStack.Screen name="ChangePassword" component={ChangePassword} options={{ title: "Change Password" }} />
      <AccountStack.Screen name="Support" component={Support} options={{ title: "Support" }} />
      <AccountStack.Screen name="Language" component={Language} options={{ title: "Language" }} />
      <AccountStack.Screen name="Notifications" component={Notifications} options={{ title: "Notifications" }} />
    </AccountStack.Navigator>
  );
}

export default function MainNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: theme.colors.surface },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ tabBarLabel: "Home", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home-outline" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Products"
        component={Product}
        options={{ tabBarLabel: "Products", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="shopping-outline" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Map"
        component={Map}
        options={{ tabBarLabel: "Map", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="map-marker-outline" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Consult"
        component={Consultant}
        options={{ tabBarLabel: "Consult", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="stethoscope" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Account"
        component={AccountNavigator}
        options={{ tabBarLabel: "Account", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-outline" color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
