import { useLocalSearchParams } from "expo-router";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getCountryByCode } from "../../../services/countriesApi";
import { auth, db } from "../../../services/firebase";

export default function CountryDetail() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [country, setCountry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (code) fetchCountry();
  }, [code]);
  useEffect(() => {
    if (userId && country) checkFav();
  }, [userId, country]);

  const fetchCountry = async () => {
    try {
      const res = await getCountryByCode(code as string);
      setCountry(res.data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkFav = async () => {
    const ref = doc(db, "favorites", `${userId}_${code}`);
    const snap = await getDoc(ref);
    setIsFav(snap.exists());
  };

  const toggleFav = async () => {
    if (!userId) return;
    const ref = doc(db, "favorites", `${userId}_${code}`);
    if (isFav) {
      await deleteDoc(ref);
      setIsFav(false);
      Alert.alert("Removido");
    } else {
      await setDoc(ref, {
        userId,
        countryCode: code,
        countryName: country.name.common,
        flagUrl: country.flags?.png,
        addedAt: new Date(),
      });
      setIsFav(true);
      Alert.alert("Favoritado");
    }
  };

  if (loading) return <ActivityIndicator size="large" />;
  if (!country) return <Text>País não encontrado</Text>;

  return (
    <View style={styles.container}>
      <Image source={{ uri: country.flags?.png }} style={styles.flag} />
      <Text style={styles.name}>{country.name.common}</Text>
      <Text>Capital: {country.capital?.[0]}</Text>
      <Text>População: {country.population?.toLocaleString()}</Text>
      <Text>Região: {country.region}</Text>
      <TouchableOpacity
        style={[styles.favButton, isFav && styles.favActive]}
        onPress={toggleFav}
      >
        <Text>{isFav ? "★ Favorito" : "☆ Favoritar"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 20 },
  flag: { width: 150, height: 100, borderRadius: 8, marginBottom: 20 },
  name: { fontSize: 28, fontWeight: "bold", marginBottom: 12 },
  favButton: {
    marginTop: 20,
    backgroundColor: "#FFD700",
    padding: 12,
    borderRadius: 30,
  },
  favActive: { backgroundColor: "#FFA500" },
});
