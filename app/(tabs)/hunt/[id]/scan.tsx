import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../../../src/lib/supabase";

export default function HuntScan() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const huntId = typeof id === "string" ? id : "";

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const barcodeTypes = useMemo(() => ["qr"], []);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission, requestPermission]);

  const claimQr = async (code: string) => {
    if (!huntId) {
      Alert.alert("Error", "Missing hunt id");
      setScanned(false);
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("hunt.claim_qr", {
        p_hunt_id: huntId,
        p_scanned_code: code,
      });

      if (error) {
        Alert.alert("Claim failed", error.message, [{ text: "OK", onPress: () => setScanned(false) }]);
        return;
      }

      const row = Array.isArray(data) ? data[0] : data;
      Alert.alert(row?.claimed ? "Success" : "Not claimed", row?.message ?? "", [
        { text: "OK", onPress: () => setScanned(false) },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Unknown error", [{ text: "OK", onPress: () => setScanned(false) }]);
    } finally {
      setLoading(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}>
        <Text>Camera permission is required</Text>
        <Pressable onPress={requestPermission} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
          <Text>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes }}
        onBarcodeScanned={(r) => {
          if (scanned) return;
          setScanned(true);
          claimQr(r.data);
        }}
      />

      <View style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
        <Pressable
          disabled={loading}
          onPress={() => setScanned(false)}
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 10,
            backgroundColor: "white",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? <ActivityIndicator /> : null}
          <Text>{loading ? "Claiming..." : "Scan again"}</Text>
        </Pressable>
      </View>
    </View>
  );
}
