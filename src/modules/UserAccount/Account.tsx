// src/modules/UserAccount/Account.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, List, Avatar, Button } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const Account: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <Card style={styles.cardWide} mode="elevated">
        <Card.Content style={styles.center}>
          <Avatar.Text label="VR" size={92} style={styles.avatar} />
          <Text style={styles.name}>Vaibhav Rajput</Text>
          <Text style={styles.muted}>vaibhav@gmail.com</Text>
          <Text style={styles.muted}>+91 79900205434</Text>
        </Card.Content>
      </Card>

      <Card style={styles.cardWide} mode="elevated">
        <List.Item
          title="Edit Profile"
          left={(p) => <List.Icon {...p} icon="account-edit-outline" />}
          style={styles.listItemSpacious}
          titleStyle={styles.listTitle}
          onPress={() => navigation.navigate("EditProfile")}
        />
        <View style={styles.dividerInset} />
        <List.Item
          title="Settings"
          left={(p) => <List.Icon {...p} icon="cog-outline" />}
          style={styles.listItemSpacious}
          titleStyle={styles.listTitle}
          onPress={() => navigation.navigate("Settings")}
        />
        <View style={styles.dividerInset} />
        <List.Item
          title="Change Password"
          left={(p) => <List.Icon {...p} icon="lock-reset" />}
          style={styles.listItemSpacious}
          titleStyle={styles.listTitle}
          onPress={() => navigation.navigate("ChangePassword")}
        />
        <View style={styles.dividerInset} />
        <List.Item
          title="Contact Support"
          left={(p) => <List.Icon {...p} icon="help-circle-outline" />}
          style={styles.listItemSpacious}
          titleStyle={styles.listTitle}
          onPress={() => navigation.navigate("Support")}
        />
        <View style={styles.dividerInset} />
        <List.Item
          title="Logout"
          titleStyle={{ color: "#B00020", fontWeight: "700" }}
          left={(p) => <List.Icon {...p} icon="logout" color="#B00020" />}
          onPress={() => {}}
          style={styles.listItemSpacious}
        />
      </Card>

      <Button mode="contained" onPress={() => {}} style={styles.ctaWide}>
        Logout
      </Button>
    </View>
  );
};

const H_MARGIN = 20;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F2", paddingHorizontal: 12, gap: 18 },
  cardWide: { backgroundColor: "#FFFFFF", borderRadius: 18, elevation: 4, marginHorizontal: H_MARGIN, overflow: "hidden" },
  center: { alignItems: "center", paddingVertical: 22, gap: 8 },
  avatar: { backgroundColor: "#6A4C93", marginBottom: 10 },
  name: { fontSize: 22, fontWeight: "700", color: "#212121" },
  muted: { color: "#757575" },
  listItemSpacious: { backgroundColor: "#FFFFFF", paddingVertical: 14, minHeight: 56 },
  listTitle: { fontSize: 16 },
  dividerInset: { height: StyleSheet.hairlineWidth + 0.25, backgroundColor: "#E8E8E8", marginLeft: 64 },
  ctaWide: { marginTop: 6, marginHorizontal: H_MARGIN, borderRadius: 26, paddingVertical: 10 },
});

export default Account;
