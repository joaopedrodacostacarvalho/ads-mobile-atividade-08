// app/index.tsx
import { Redirect } from "expo-router";
import { auth } from "../services/firebase";

export default function Index() {
  const user = auth.currentUser;
  if (user) {
    // Se estiver logado, vai para a home
    return <Redirect href="/(app)/home" />;
  } else {
    // Se não estiver logado, vai para o login
    return <Redirect href="/login" />;
  }
}
