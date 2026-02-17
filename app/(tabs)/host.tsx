import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, Image, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { sha256 } from "js-sha256";
import { supabase } from "../../src/lib/supabase";

export default function Host() {
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [lastHuntId, setLastHuntId] = useState<string | null>(null);

  const [qrPlain, setQrPlain] = useState("");
  const [lastQrId, setLastQrId] = useState<string | null>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const createHunt = async () => {
    if (!title.trim()) return Alert.alert("Validation", "Hunt title is required");

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return Alert.alert("Auth", "User not found");

      const { data, error } = await supabase
        .schema("hunt")
        .from("hunts")
        .insert({ owner_id: userId, title: title.trim(), is_published: true })
        .select("id")
        .single();

      if (error) throw error;

      setLastHuntId(data.id);
      Alert.alert("Success", `Hunt created: ${data.id}`);
    } catch (e: any) {
      Alert.alert("Create hunt error", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const createQr = async () => {
    if (!lastHuntId) return Alert.alert("Validation", "Create a hunt first");
    if (!qrPlain.trim()) return Alert.alert("Validation", "QR text is required");

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return Alert.alert("Auth", "User not found");

      const hex = sha256(qrPlain.trim());

      const { data, error } = await supabase
        .schema("hunt")
        .from("qr_codes")
        .insert({
          hunt_id: lastHuntId,
          owner_id: userId,
          code_hash: `\\x${hex}`,
          title: "QR",
          is_active: true,
        })
        .select("id")
        .single();

      if (error) throw error;

      setLastQrId(data.id);
      Alert.alert("Success", `QR created: ${data.id}`);
    } catch (e: any) {
      Alert.alert("Create QR error", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const pickAndUpload = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission required", "Gallery access is needed");

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (res.canceled) return;

    const uri = res.assets[0].uri;
    setPreview(uri);

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return Alert.alert("Auth", "User not found");

      const fileExt = uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/hunt/${Date.now()}.${fileExt}`;

      const blob = await (await fetch(uri)).blob();

      const { error } = await supabase.storage
        .from("hunt_uploads")
        .upload(path, blob, { contentType: `image/${fileExt}`, upsert: true });

      if (error) throw error;

      Alert.alert("Success", "File uploaded successfully");
    } catch (e: any) {
      Alert.alert("Upload error", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Host Panel</Text>

      <TextInput
        placeholder="Hunt title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <Pressable disabled={loading} onPress={createHunt} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
        <Text>{loading ? "Processing..." : "Create Hunt"}</Text>
      </Pressable>

      {lastHuntId && <Text>Hunt ID: {lastHuntId}</Text>}

      <View style={{ height: 1, backgroundColor: "#ddd", marginVertical: 8 }} />

      <TextInput
        placeholder="QR text (not stored in DB)"
        value={qrPlain}
        onChangeText={setQrPlain}
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <Pressable disabled={loading} onPress={createQr} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
        <Text>{loading ? "Processing..." : "Create QR (hashed)"}</Text>
      </Pressable>

      {lastQrId && <Text>QR ID: {lastQrId}</Text>}

      <View style={{ height: 1, backgroundColor: "#ddd", marginVertical: 8 }} />

      {preview && (
        <Image source={{ uri: preview }} style={{ width: "100%", height: 220, borderRadius: 12 }} />
      )}

      <Pressable disabled={loading} onPress={pickAndUpload} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
        <Text>{loading ? "Uploading..." : "Select & Upload Image"}</Text>
      </Pressable>
    </ScrollView>
  );
}
