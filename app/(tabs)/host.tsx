import { sha256 } from "js-sha256";

const [qrPlain, setQrPlain] = useState("");
const [lastQrId, setLastQrId] = useState<string | null>(null);

const createQr = async () => {
  if (!lastHuntId) return Alert.alert("Hunt", "Önce hunt oluştur");
  if (!qrPlain.trim()) return Alert.alert("QR", "QR code string gerekli");

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id!;

  // sha256 hex -> bytea için Postgres tarafında decode() kullanacağız
  const hex = sha256(qrPlain.trim());

  const { data, error } = await supabase
    .schema("hunt")
    .from("qr_codes")
    .insert({
      hunt_id: lastHuntId,
      owner_id: userId,
      code_hash: `\\x${hex}`, // bytea literal
      title: "QR",
      is_active: true,
    })
    .select("id")
    .single();

  if (error) return Alert.alert("Create QR error", error.message);
  setLastQrId(data.id);
  Alert.alert("QR created", data.id);
};
