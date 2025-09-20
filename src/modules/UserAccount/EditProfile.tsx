import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { TextInput, Button, Text, Avatar, useTheme, Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Profile = { name: string; email: string; phone: string };
const STORAGE_KEY = "profile";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function EditProfile() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [form, setForm] = useState<Profile>({ name: "", email: "", phone: "" });

  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) setForm(JSON.parse(json) as Profile);
      else setForm({ name: "Vaibhav Rajput", email: "vaibhav@gmail.com", phone: "7990020543" });
    })();
  }, []);

  const update = (k: keyof Profile, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSave = async () => {
    if (!form.name.trim()) return Alert.alert("Validation", "Enter full name");
    if (!EMAIL_REGEX.test(form.email.trim())) return Alert.alert("Validation", "Enter a valid email");
    if (form.phone.trim().length < 8) return Alert.alert("Validation", "Enter a valid phone");
    try {
      await sleep(150);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      Alert.alert("Success", "Profile saved");
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Could not save");
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.headerContent}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => Alert.alert("Profile photo", "Image picker removed in this build.")}>
            <Avatar.Text label="VR" size={96} style={{ backgroundColor: theme.colors.primary }} />
          </TouchableOpacity>
          <Text style={styles.changePhoto} variant="labelLarge">
            Change photo
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.form}>
        <TextInput
          mode="outlined"
          label="Full name"
          value={form.name}
          onChangeText={(t) => update("name", t)}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(t) => update("email", t)}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Phone"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(t) => update("phone", t)}
          style={styles.input}
        />
        <Button mode="contained" onPress={onSave} style={styles.saveBtn} contentStyle={{ paddingVertical: 6 }}>
          Change
        </Button>
        <Button mode="text" onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          Cancel
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F5F5F5" },
  card: { borderRadius: 14, marginBottom: 16, backgroundColor: "#fff" },
  headerContent: { alignItems: "center", paddingVertical: 18 },
  changePhoto: { marginTop: 10, color: "#2E7D32" },
  form: { backgroundColor: "#fff", borderRadius: 14, padding: 14 },
  input: { marginBottom: 12 },
  saveBtn: { marginTop: 8, borderRadius: 10 },
  cancelBtn: { marginTop: 6 },
});
