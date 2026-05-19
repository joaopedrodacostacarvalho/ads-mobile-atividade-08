// app/(app)/profile.tsx
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { uploadImage } from "../../services/cloudinary";
import { auth, db } from "../../services/firebase";

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) loadUserData();
  }, [user]);

  const loadUserData = async () => {
    const docSnap = await getDoc(doc(db, "users", user!.uid));
    if (docSnap.exists()) {
      setDisplayName(docSnap.data().displayName || "");
      setPhotoURL(docSnap.data().photoURL || null);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à sua galeria para alterar a foto.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setLoading(true);
      try {
        const imageUrl = await uploadImage(result.assets[0].uri);
        setPhotoURL(imageUrl);
        await setDoc(
          doc(db, "users", user!.uid),
          { photoURL: imageUrl },
          { merge: true },
        );
        Alert.alert("Sucesso", "Foto de perfil atualizada!");
      } catch (error) {
        Alert.alert("Erro", "Falha ao enviar imagem. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
  };

  const updateDisplayName = async () => {
    if (!displayName.trim()) {
      Alert.alert("Atenção", "Digite um nome válido.");
      return;
    }
    setUpdating(true);
    try {
      await setDoc(
        doc(db, "users", user!.uid),
        { displayName: displayName.trim() },
        { merge: true },
      );
      Alert.alert("Sucesso", "Nome atualizado!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o nome.");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Sair", "Tem certeza que deseja desconectar?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await auth.signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
      </View>

      <View style={styles.avatarContainer}>
        <TouchableOpacity
          onPress={pickImage}
          disabled={loading}
          style={styles.avatarTouch}
        >
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderText}>
                {displayName
                  ? displayName.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.editIconBadge}>
            <Text style={styles.editIcon}>📷</Text>
          </View>
        </TouchableOpacity>
        {loading && <ActivityIndicator style={styles.loaderOverlay} />}
        <Text style={styles.avatarHint}>Toque para alterar a foto</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.nameRow}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Seu nome"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity
            style={[styles.saveButton, updating && styles.disabledButton]}
            onPress={updateDisplayName}
            disabled={updating}
          >
            <Text style={styles.saveButtonText}>
              {updating ? "Salvando..." : "Salvar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sair da conta</Text>
      </TouchableOpacity>

      <Text style={styles.version}>App v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f8",
  },
  header: {
    backgroundColor: "#007AFF",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: -50,
    marginBottom: 20,
  },
  avatarTouch: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#ddd",
  },
  avatarPlaceholder: {
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  editIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editIcon: {
    fontSize: 20,
  },
  loaderOverlay: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    width: 80,
  },
  value: {
    fontSize: 16,
    color: "#555",
    flex: 1,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
  nameRow: {
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  version: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 12,
    color: "#aaa",
  },
});
