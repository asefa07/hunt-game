import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { supabase } from "../src/lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      return Alert.alert("Sign up error", error.message);
    }

    Alert.alert("Success", "Account created. Check your email if verification is enabled.");
  };

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      return Alert.alert("Sign in error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>Login</Text>

      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <Pressable
        disabled={loading}
        onPress={signIn}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text>{loading ? "Loading..." : "Sign In"}</Text>
      </Pressable>

      <Pressable
        disabled={loading}
        onPress={signUp}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text>{loading ? "Loading..." : "Sign Up"}</Text>
      </Pressable>
    </View>
  );
}
