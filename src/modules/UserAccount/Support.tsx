// src/modules/Support.tsx
import React from "react";
import { View, StyleSheet, Linking, Platform, Alert } from "react-native";
import { List, Divider, TextInput, Button, HelperText, useTheme, Card, Text } from "react-native-paper";

const SUPPORT_EMAIL = "support@example.com";
const SUPPORT_PHONE = "+919999999999";      // E.164 format
const WHATSAPP_NUMBER = "+919999999999";    // E.164 format
const FAQ_URL = "https://example.com/faq";

export default function Support() {
  const theme = useTheme();

  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const invalid = message.trim().length < 4;

  const mail = async () => {
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject || "App support"
    )}&body=${encodeURIComponent(message)}`;
    try {
      const ok = await Linking.canOpenURL(mailto);
      if (ok) await Linking.openURL(mailto);
      else Alert.alert("No email app found");
    } catch (e: any) {
      Alert.alert("Email error", String(e?.message || e));
    }
  };

  const call = async () => {
    try {
      await Linking.openURL(`tel:${SUPPORT_PHONE}`);
    } catch {}
  };

  const whatsapp = async () => {
    const text = encodeURIComponent(message || "Hello, I need help.");
    const url = Platform.select({
      ios: `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${text}`,
      android: `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`,
    }) as string;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("WhatsApp not installed");
    }
  };

  const faq = async () => {
    try {
      await Linking.openURL(FAQ_URL);
    } catch {}
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <List.Section>
          <List.Subheader>Contact</List.Subheader>

          <List.Item
            title="Email us"
            description={SUPPORT_EMAIL}
            left={(p) => <List.Icon {...p} icon="email-outline" />}
            onPress={mail}
          />
          <Divider />
          <List.Item
            title="Call us"
            description={SUPPORT_PHONE}
            left={(p) => <List.Icon {...p} icon="phone" />}
            onPress={call}
          />
          <Divider />
          <List.Item
            title="WhatsApp"
            description="Chat with support"
            left={(p) => <List.Icon {...p} icon="whatsapp" />}
            onPress={whatsapp}
          />
          <Divider />
          <List.Item
            title="FAQs"
            description="Common questions"
            left={(p) => <List.Icon {...p} icon="help-circle-outline" />}
            right={(p) => <List.Icon {...p} icon="open-in-new" />}
            onPress={faq}
          />
        </List.Section>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <List.Subheader>Send feedback</List.Subheader>
          <TextInput
            mode="outlined"
            label="Subject"
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Message"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            style={[styles.input, { height: 120 }]}
          />
          <HelperText type={invalid ? "error" : "info"} visible>
            {invalid ? "Enter at least 4 characters" : " "}
          </HelperText>
          <Button mode="contained" onPress={mail} disabled={invalid} style={styles.button}>
            Send via email
          </Button>
        </Card.Content>
      </Card>

      <Text style={styles.note} variant="bodySmall">
        Support hours: 9 AM–6 PM IST, Mon–Sat
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { borderRadius: 14, marginBottom: 12 },
  input: { marginBottom: 10 },
  button: { borderRadius: 10 },
  note: { textAlign: "center", color: "#6b6b6b", marginTop: 6 },
});
