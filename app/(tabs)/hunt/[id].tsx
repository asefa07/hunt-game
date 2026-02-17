import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Pressable, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "../../src/lib/supabase";

type HuntRow = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  owner_id: string;
  is_published: boolean;
};

export default function HuntDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const huntId = typeof id === "string" ? id : "";
  const [loading, setLoading] = useState(true);
  const [hunt, setHunt] = useState<HuntRow | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!huntId) return;

      setLoading(true);
      const { data, error } = await supabase
        .schema("hunt")
        .from("hunts")
        .select("id,title,description,starts_at,ends_at,owner_id,is_published")
        .eq("id", huntId)
        .single();

      setLoading(false);

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
      setHunt(data as HuntRow);
    };

    run();
  }, [huntId]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  if (!hunt) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text>Hunt not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>{hunt.title}</Text>
      {hunt.description ? <Text style={{ opacity: 0.85 }}>{hunt.description}</Text> : null}
      <Text style={{ opacity: 0.6, fontSize: 12 }}>Hunt ID: {hunt.id}</Text>

      <Pressable
        onPress={() => router.push(`/hunt/${hunt.id}/scan`)}
        style={{ marginTop: 12, padding: 12, borderWidth: 1, borderRadius: 10, alignItems: "center" }}
      >
        <Text>Start Scan</Text>
      </Pressable>
    </View>
  );
}
