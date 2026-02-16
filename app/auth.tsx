import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { supabase } from "../src/lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const signUp = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) return Alert.alert("Sign up error", error.message);
    Alert.alert("OK", "Kayıt tamam. Email doğrulama açıksa mailini kontrol et.");
  };

  const signIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return Alert.alert("Sign in error", error.message);
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>Giriş</Text>

      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />
      <TextInput
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <Pressable disabled={busy} onPress={signIn} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
        <Text>{busy ? "..." : "Sign In"}</Text>
      </Pressable>

      <Pressable disabled={busy} onPress={signUp} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
        <Text>{busy ? "..." : "Sign Up"}</Text>
      </Pressable>
    </View>
  );
}
