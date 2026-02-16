import { useState } from "react";
import { View, Text, Pressable, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../src/lib/supabase";

export default function Host() {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pickAndUpload = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission", "Galeri izni gerekli");

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (res.canceled) return;

    const uri = res.assets[0].uri;
    setPreview(uri);

    setBusy(true);
    try {
      const fileExt = uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `hunt/${Date.now()}.${fileExt}`;
      const blob = await (await fetch(uri)).blob();

      const { error } = await supabase.storage
        .from("uploads")
        .upload(path, blob, { contentType: `image/${fileExt}`, upsert: true });

      if (error) throw error;

      Alert.alert("Yüklendi", path);
    } catch (e: any) {
      Alert.alert("Upload error", e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Host</Text>

      {preview ? (
        <Image source={{ uri: preview }} style={{ width: "100%", height: 220, borderRadius: 12 }} />
      ) : null}

      <Pressable disabled={busy} onPress={pickAndUpload} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
        <Text>{busy ? "Yükleniyor..." : "Görsel seç & yükle"}</Text>
      </Pressable>
    </View>
  );
}
