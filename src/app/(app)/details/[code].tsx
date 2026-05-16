// app/(app)/details/[code].tsx
import { useLocalSearchParams } from 'expo-router';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCountryByCode } from '../../services/countriesApi';
import { auth, db } from '../../services/firebase';

export default function CountryDetail() {
  // O parâmetro vem como string diretamente
  const { code } = useLocalSearchParams<{ code: string }>();
  const [country, setCountry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (code) fetchCountry();
  }, [code]);

  useEffect(() => {
    if (userId && country) checkFavoriteStatus();
  }, [userId, country]);

  const fetchCountry = async () => {
    try {
      const res = await getCountryByCode(code as string);
      setCountry(res.data[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!userId || !code) return;
    const favRef = doc(db, 'favorites', `${userId}_${code}`);
    const docSnap = await getDoc(favRef);
    setIsFavorite(docSnap.exists());
  };

  const toggleFavorite = async () => {
    if (!userId || !code) return;
    const favRef = doc(db, 'favorites', `${userId}_${code}`);
    if (isFavorite) {
      await deleteDoc(favRef);
      setIsFavorite(false);
      Alert.alert('Removido', 'País removido dos favoritos');
    } else {
      await setDoc(favRef, {
        userId,
        countryCode: code,
        countryName: country.name.common,
        flagUrl: country.flags?.png,
        addedAt: new Date(),
      });
      setIsFavorite(true);
      Alert.alert('Favoritado', 'País adicionado aos favoritos');
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (!country) return <Text>País não encontrado</Text>;

  return (
    <View style={styles.container}>
      <Image source={{ uri: country.flags?.png }} style={styles.flagLarge} />
      <Text style={styles.name}>{country.name.common}</Text>
      <Text style={styles.detail}>Capital: {country.capital?.[0] || 'N/A'}</Text>
      <Text style={styles.detail}>População: {country.population?.toLocaleString()}</Text>
      <Text style={styles.detail}>
        Moedas: {Object.values(country.currencies || {}).map((c: any) => c.name).join(', ') || 'N/A'}
      </Text>
      <Text style={styles.detail}>Região: {country.region}</Text>
      <TouchableOpacity style={[styles.favButton, isFavorite && styles.favActive]} onPress={toggleFavorite}>
        <Text style={styles.favText}>{isFavorite ? '★ Favoritado' : '☆ Favoritar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#fff' },
  flagLarge: { width: 150, height: 100, borderRadius: 8, marginBottom: 20 },
  name: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  detail: { fontSize: 16, marginBottom: 8, textAlign: 'center' },
  favButton: { marginTop: 20, backgroundColor: '#FFD700', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30 },
  favActive: { backgroundColor: '#FFA500' },
  favText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
});