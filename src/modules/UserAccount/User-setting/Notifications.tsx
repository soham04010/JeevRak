// src/modules/settings/Notifications.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Linking, Platform } from "react-native";
import { List, Switch, Divider, Button, useTheme, Card, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Prefs = {
  push: boolean;
  marketing: boolean;
  systemAlerts: boolean;
};

const STORAGE_KEY = "app.notifications";

const defaultPrefs: Prefs = {
  push: true,
  marketing: false,
  systemAlerts: true,
};

export default function Notifications() {
  const theme = useTheme();
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        try {
          const parsed = JSON.parse(json) as Prefs;
          setPrefs({ ...defaultPrefs, ...parsed });
        } catch {
          // ignore parsing errors, keep defaults
        }
      }
    })();
  }, []);

  const update = (k: keyof Prefs, v: boolean) => setPrefs((p) => ({ ...p, [k]: v }));

  const save = async () => {
    try {
      setSaving(true);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } finally {
      setSaving(false);
    }
  };

  const openSystemSettings = () => {
    if (Platform.OS === "android") {
      Linking.openSettings();
    } else {
      Linking.openURL("App-Prefs:"); // iOS shortcut; may vary by OS version
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <List.Section>
          <List.Subheader>Notifications</List.Subheader>

          <List.Item
            title="Push notifications"
            description="Receive in-app push alerts"
            left={(p) => <List.Icon {...p} icon="bell-outline" />}
            right={() => (
              <Switch value={prefs.push} onValueChange={(v) => update("push", v)} />
            )}
          />
          <Divider />

          <List.Item
            title="Marketing updates"
            description="Offers, tips, and promotions"
            left={(p) => <List.Icon {...p} icon="bullhorn-outline" />}
            right={() => (
              <Switch value={prefs.marketing} onValueChange={(v) => update("marketing", v)} />
            )}
          />
          <Divider />

          <List.Item
            title="System alerts"
            description="Security and important notices"
            left={(p) => <List.Icon {...p} icon="alert-circle-outline" />}
            right={() => (
              <Switch value={prefs.systemAlerts} onValueChange={(v) => update("systemAlerts", v)} />
            )}
          />
        </List.Section>
      </Card>

      <Button
        mode="contained"
        onPress={save}
        loading={saving}
        style={styles.saveBtn}
        contentStyle={{ paddingVertical: 6 }}
      >
        Save preferences
      </Button>

      <Card style={[styles.card, { marginTop: 12 }]}>
        <Card.Content>
          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
            Not receiving notifications?
          </Text>
          <Button mode="outlined" onPress={openSystemSettings} icon="cog-outline">
            Open system settings
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  card: { borderRadius: 14 },
  saveBtn: { borderRadius: 10, marginTop: 8 },
});
