import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function Home() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>Hunt Game</Text>

      <Pressable
        onPress={() => router.push("/auth")}
        style={{ paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderRadius: 10 }}
      >
        <Text>Go to Auth</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(tabs)")}
        style={{ paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderRadius: 10 }}
      >
        <Text>Enter App (Tabs)</Text>
      </Pressable>
    </View>
  );
}
