// src/modules/UserAccount/Logout.tsx
import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Card, Text, Button, List, useTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, CommonActions } from "@react-navigation/native";

const KEYS_TO_CLEAR = [
  "profile",           // from EditProfile.tsx
  "app.language",      // from Language.tsx
  "app.notifications", // from Notifications.tsx
  // add any other auth/session keys here
];

export default function Logout() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [busy, setBusy] = React.useState(false);

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: doLogout },
    ]);
  };

  const doLogout = async () => {
    try {
      setBusy(true);
      // If using a real auth token, revoke it here (API call) before clearing storage.

      // Clear local keys
      await AsyncStorage.multiRemove(KEYS_TO_CLEAR);

      // Reset navigation state to the app entry (Home tab here)
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not logout");
    } finally {
      setBusy(false);
    }
  };

  const switchAccount = async () => {
    // Optional: Clear only session-related keys, then navigate to a login/onboarding screen
    Alert.alert("Switch account", "Implement account switch flow here.");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Title title="Logout" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.text}>
            Logging out will remove locally stored preferences and profile from this device.
          </Text>

          <List.Section>
            <List.Item
              title="Profile data"
              description="Name, email, phone saved on device"
              left={(p) => <List.Icon {...p} icon="account-outline" />}
            />
            <List.Item
              title="Language preference"
              description="Saved app language"
              left={(p) => <List.Icon {...p} icon="translate" />}
            />
            <List.Item
              title="Notification preferences"
              description="Push/marketing toggles"
              left={(p) => <List.Icon {...p} icon="bell-outline" />}
            />
          </List.Section>

          <Button
            mode="contained"
            onPress={confirmLogout}
            loading={busy}
            disabled={busy}
            style={styles.logoutBtn}
            contentStyle={{ paddingVertical: 6 }}
          >
            Logout now
          </Button>

          <Button
            mode="text"
            onPress={switchAccount}
            disabled={busy}
            style={styles.switchBtn}
          >
            Switch account
          </Button>
        </Card.Content>
      </Card>

      <Text variant="bodySmall" style={styles.note}>
        Tip: Re-login anytime to restore account access.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  card: { borderRadius: 14 },
  text: { marginBottom: 8, color: "#6b6b6b" },
  logoutBtn: { marginTop: 6, borderRadius: 10 },
  switchBtn: { marginTop: 6 },
  note: { textAlign: "center", color: "#6b6b6b", marginTop: 8 },
});
