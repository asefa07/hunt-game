import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { supabase } from "../../src/lib/supabase";

type HuntRow = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_published: boolean;
  created_at: string;
};

export default function Feed() {
  const [items, setItems] = useState<HuntRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .schema("hunt")
      .from("hunts")
      .select("id,title,description,starts_at,ends_at,is_published,created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) setItems(data as HuntRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading hunts...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>Hunts</Text>

      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/hunt/${item.id}`)}
            style={{ borderWidth: 1, borderRadius: 12, padding: 14 }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.title}</Text>
            {item.description ? (
              <Text style={{ marginTop: 6, opacity: 0.8 }} numberOfLines={2}>
