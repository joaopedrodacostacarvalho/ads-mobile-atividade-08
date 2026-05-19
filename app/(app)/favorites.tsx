import { router } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../services/firebase";

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!userId) return;
    const q = query(collection(db, "favorites"), where("userId", "==", userId));
    const snap = await getDocs(q);
    setFavorites(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const remove = async (id: string, name: string) => {
    Alert.alert("Remover", `Remover ${name}?`, [
      { text: "Cancelar" },
      {
        text: "Remover",
        onPress: async () => {
          await deleteDoc(doc(db, "favorites", id));
          loadFavorites();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <Text>Nenhum favorito</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/details/[code]",
                  params: { code: item.countryCode },
                })
              }
              onLongPress={() => remove(item.id, item.countryName)}
            >
              <Image source={{ uri: item.flagUrl }} style={styles.flag} />
              <Text style={styles.name}>{item.countryName}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  flag: { width: 50, height: 35, marginRight: 12 },
  name: { fontSize: 18 },
});
