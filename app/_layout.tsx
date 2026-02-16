import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabase";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {signedIn ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="auth" />
      )}
    </Stack>
  );
}
