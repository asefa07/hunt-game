import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function Hunt() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const barcodeTypes = useMemo(() => ["qr"], []);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission, requestPermission]);

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}>
        <Text>Kamera izni gerekli</Text>
        <Pressable onPress={requestPermission} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
          <Text>İzin ver</Text>
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
          Alert.alert("QR Okundu", r.data, [{ text: "OK", onPress: () => setScanned(false) }]);
        }}
      />
      <View style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
        <Pressable onPress={() => setScanned(false)} style={{ padding: 12, borderWidth: 1, borderRadius: 10, backgroundColor: "white" }}>
          <Text>Tekrar tara</Text>
        </Pressable>
      </View>
    </View>
  );
}
