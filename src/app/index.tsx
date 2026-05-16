import { Redirect } from "expo-router";

export default function Index() {
  // Você pode adicionar lógica para verificar se o usuário já está logado
    
  return <Redirect href="/login" />;
}