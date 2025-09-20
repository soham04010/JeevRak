// src/modules/settings/Language.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { List, RadioButton, Button, Text, useTheme, Card } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

type LangCode = "en" | "hi" | "gu" | "mr";
const STORAGE_KEY = "app.language";

const LANGS: { code: LangCode; name: string }[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिंदी)" },
  { code: "gu", name: "Gujarati (ગુજરાતી)" },
  { code: "mr", name: "Marathi (मराठी)" },
];

export default function Language() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [saved, setSaved] = useState<LangCode>("en");
  const [selected, setSelected] = useState<LangCode>("en");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem(STORAGE_KEY);
      if (v && (["en", "hi", "gu", "mr"] as string[]).includes(v)) {
        setSaved(v as LangCode);
        setSelected(v as LangCode);
      }
    })();
  }, []);

  const onSave = async () => {
    try {
      setLoading(true);
      await AsyncStorage.setItem(STORAGE_KEY, selected);
      setSaved(selected);
      // If using an i18n library, also call i18n.changeLanguage(selected)
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 10 }}>
            Choose language
          </Text>
          <RadioButton.Group onValueChange={(v) => setSelected(v as LangCode)} value={selected}>
            {LANGS.map((l) => (
              <List.Item
                key={l.code}
                title={l.name}
                onPress={() => setSelected(l.code)}
                right={() => <RadioButton value={l.code} />}
              />
            ))}
          </RadioButton.Group>

          <Text variant="bodySmall" style={styles.current}>
            Current: {saved.toUpperCase()}
          </Text>

          <Button
            mode="contained"
            onPress={onSave}
            loading={loading}
            disabled={saved === selected || loading}
            style={styles.button}
          >
            Save
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  card: { borderRadius: 14 },
  current: { color: "#6b6b6b", marginTop: 8, marginBottom: 6 },
  button: { borderRadius: 10, marginTop: 6 },
});
