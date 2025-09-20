// src/modules/Settings.tsx
import React from "react";
import { View, StyleSheet, Linking } from "react-native";
import { List, Switch, Divider, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

type Nav = {
  navigate: (s: "EditProfile" | "ChangePassword" | "Support" | "Language" | "Notifications") => void;
};

const Settings: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const [notifEnabled, setNotifEnabled] = React.useState(true);

  const openUrl = async (url: string) => { try { await Linking.openURL(url); } catch {} };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item title="Edit Profile" description="Update name, email, phone, and photo" onPress={() => navigation.navigate("EditProfile")} left={(p) => <List.Icon {...p} icon="account-edit" />} />
        <Divider />
        <List.Item title="Change Password" description="Update account password" onPress={() => navigation.navigate("ChangePassword")} left={(p) => <List.Icon {...p} icon="lock-reset" />} />
      </List.Section>

      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item title="Language" description="App language" onPress={() => navigation.navigate("Language")} left={(p) => <List.Icon {...p} icon="translate" />} right={(p) => <List.Icon {...p} icon="chevron-right" />} />
        <Divider />
        <List.Item title="Notifications" description={notifEnabled ? "Enabled" : "Disabled"} onPress={() => navigation.navigate("Notifications")} left={(p) => <List.Icon {...p} icon="bell-outline" />} right={() => <Switch value={notifEnabled} onValueChange={setNotifEnabled} />} />
      </List.Section>

      <List.Section>
        <List.Subheader>Support</List.Subheader>
        <List.Item title="Contact Support" description="Get help and send feedback" onPress={() => navigation.navigate("Support")} left={(p) => <List.Icon {...p} icon="lifebuoy" />} />
        <Divider />
        <List.Item title="Privacy Policy" onPress={() => openUrl("https://example.com/privacy")} left={(p) => <List.Icon {...p} icon="file-document-outline" />} />
        <List.Item title="Terms of Service" onPress={() => openUrl("https://example.com/terms")} left={(p) => <List.Icon {...p} icon="file-document" />} />
      </List.Section>
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 6 } });
export default Settings;
