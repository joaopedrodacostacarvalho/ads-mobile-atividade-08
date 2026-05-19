import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#007AFF" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen name="home" options={{ title: "Descubra Países" }} />
      <Stack.Screen name="details/[code]" options={{ title: "Detalhes" }} />
      <Stack.Screen name="favorites" options={{ title: "Favoritos" }} />
      <Stack.Screen name="profile" options={{ title: "Perfil" }} />
    </Stack>
  );
}
