// src/modules/ChangePassword.tsx
import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Card, Text, HelperText, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const MIN_LEN = 8;

export default function ChangePassword() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  const [showCur, setShowCur] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showCon, setShowCon] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const tooShort = (s: string) => s.trim().length < MIN_LEN;
  const mismatch = confirm.length > 0 && next !== confirm;

  const canSubmit =
    !tooShort(current) && !tooShort(next) && !mismatch && confirm.length >= MIN_LEN;

  const submit = async () => {
    if (!canSubmit) return;

    try {
      setLoading(true);

      // TODO: replace this with real API call
      await new Promise((r) => setTimeout(r, 600));

      Alert.alert("Success", "Password changed successfully");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Title title="Change Password" />
        <Card.Content>
          <TextInput
            mode="outlined"
            label="Current password"
            value={current}
            onChangeText={setCurrent}
            secureTextEntry={!showCur}
            right={
              <TextInput.Icon
                icon={showCur ? "eye-off-outline" : "eye-outline"}
                onPress={() => setShowCur((s) => !s)}
              />
            }
            style={styles.input}
          />
          <HelperText type={tooShort(current) ? "error" : "info"} visible>
            {tooShort(current) ? `Required, min ${MIN_LEN} characters` : " "}
          </HelperText>

          <TextInput
            mode="outlined"
            label="New password"
            value={next}
            onChangeText={setNext}
            secureTextEntry={!showNew}
            right={
              <TextInput.Icon
                icon={showNew ? "eye-off-outline" : "eye-outline"}
                onPress={() => setShowNew((s) => !s)}
              />
            }
            style={styles.input}
          />
          <HelperText type={tooShort(next) ? "error" : "info"} visible>
            {tooShort(next) ? `Required, min ${MIN_LEN} characters` : " "}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Confirm new password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showCon}
            right={
              <TextInput.Icon
                icon={showCon ? "eye-off-outline" : "eye-outline"}
                onPress={() => setShowCon((s) => !s)}
              />
            }
            style={styles.input}
          />
          <HelperText type={mismatch ? "error" : "info"} visible>
            {mismatch ? "Passwords do not match" : " "}
          </HelperText>

          <Button
            mode="contained"
            onPress={submit}
            loading={loading}
            disabled={!canSubmit || loading}
            style={styles.button}
            contentStyle={{ paddingVertical: 6 }}
          >
            Update Password
          </Button>
        </Card.Content>
      </Card>

      <Text style={styles.note} variant="bodySmall">
        Tip: Use at least 8 characters with a mix of letters, numbers, and symbols.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  card: { borderRadius: 14 },
  input: { marginTop: 4 },
  button: { marginTop: 8, borderRadius: 10 },
  note: { textAlign: "center", color: "#6b6b6b", marginTop: 8 },
});
