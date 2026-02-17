import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

// ✅ Adjust this import path to match your project
import { supabase } from "../lib/supabase"; // <-- CHANGE IF NEEDED

export default function Hunt() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const barcodeTypes = useMemo(() => ["qr"], []);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission, requestPermission]);

  /**
   * Flexible QR payload parser.
   * Supported examples:
   * 1) JSON: {"huntId":"...","qrId":"..."} or {"hunt_id":"...","qr_id":"..."}
   * 2) "huntId:qrId" (two-part string)
   * 3) Single value (qrId) -> if your RPC does not require huntId
   */
  const parseQrPayload = (raw: string) => {
    // Try JSON first
    try {
      const obj = JSON.parse(raw);
      const huntId = obj.huntId ?? obj.hunt_id ?? obj.hunt ?? null;
      const qrId = obj.qrId ?? obj.qr_id ?? obj.qr ?? obj.code ?? null;
      return { huntId, qrId, raw };
    } catch {
      // Try "a:b" format
      if (raw.includes(":")) {
        const [huntId, qrId] = raw.split(":").map((s) => s.trim());
        return { huntId: huntId || null, qrId: qrId || null, raw };
      }
      // Single value fallback
      return { huntId: null, qrId: raw.trim() || null, raw };
    }
  };

  const claimQr = async (rawData: string) => {
    if (isClaiming) return;

    const { huntId, qrId } = parseQrPayload(rawData);

    // Adjust this validation based on your RPC requirements
    if (!qrId && !huntId) {
      Alert.alert("Invalid QR", "Could not parse QR payload.");
      setScanned(false);
      return;
    }

    setIsClaiming(true);
    try {
      // If authenticated, attach user id to the claim
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id ?? null;

      /**
       * ✅ RPC CALL
       * Update RPC name + parameter names to match your database function.
       *
       * Current assumption:
       * - RPC name: "claim_qr"
       * - Params: p_hunt_id, p_qr_id, p_user_id
       */
      const { data, error } = await supabase.rpc("claim_qr", {
        p_hunt_id: huntId,
        p_qr_id: qrId,
        p_user_id: userId,
      });

      if (error) {
        Alert.alert("Claim failed", error.message);
        setScanned(false);
        return;
      }

      Alert.alert(
        "Success 🎉",
        typeof data === "string" ? data : data?.message ?? "QR claimed successfully.",
        [{ text: "OK", onPress: () => setScanned(false) }]
      );
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Unknown error");
      setScanned(false);
    } finally {
      setIsClaiming(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}>
        <Text>Camera permission is required</Text>
        <Pressable onPress={requestPermission} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
          <Text>Grant permission</Text>
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

          // ✅ Scan -> claim RPC
          claimQr(r.data);
        }}
      />

      {/* Bottom action bar */}
      <View style={{ position: "absolute", bottom: 24, left: 24, right: 24, gap: 12 }}>
        <Pressable
          disabled={isClaiming}
          onPress={() => setScanned(false)}
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 10,
            backgroundColor: "white",
            opacity: isClaiming ? 0.6 : 1,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {isClaiming ? <ActivityIndicator /> : null}
          <Text>{isClaiming ? "Claiming..." : "Scan again"}</Text>
        </Pressable>
      </View>
    </View>
  );
}
