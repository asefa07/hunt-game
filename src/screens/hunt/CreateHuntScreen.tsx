import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";

export default function CreateHuntScreen() {
  const [title, setTitle] = useState("");
  const [lastHuntId, setLastHuntId] = useState<string | null>(null);

  const createHunt = async () => {
    // buraya supabase insert gelecek
    console.log("Creating hunt:", title);

    // geçici fake id
    const fakeId = Math.random().toString(36).substring(7);
    setLastHuntId(fakeId);
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 16 }}>
      
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Create New Hunt
      </Text>

      <TextInput
        placeholder="Hunt title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <Pressable
        onPress={createHunt}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text>Create Hunt (Publish)</Text>
      </Pressable>

      {lastHuntId ? (
        <Text>Last huntId: {lastHuntId}</Text>
      ) : null}

    </View>
  );
}
