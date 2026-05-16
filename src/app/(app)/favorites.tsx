// app/(app)/favorites.tsx
import { router } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../services/firebase';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!userId) return;
    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFavorites(list);
    setLoading(false);
  };

  const removeFavorite = async (id: string, countryName: string) => {
    Alert.alert('Remover', `Remover ${countryName} dos favoritos?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'favorites', id));
          setFavorites(prev => prev.filter(fav => fav.id !== id));
        },
      },
    ]);
  };

  const handleFavoritePress = (countryCode: string) => {
    router.push({
      pathname: '/details/[code]',
      params: { code: countryCode }
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleFavoritePress(item.countryCode)}
      onLongPress={() => removeFavorite(item.id, item.countryName)}
    >
      <Image source={{ uri: item.flagUrl }} style={styles.flag} />
      <Text style={styles.name}>{item.countryName}</Text>
    </TouchableOpacity>
  );

  if (loading) return <Text>Carregando...</Text>;
  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <Text style={styles.empty}>Nenhum país favoritado ainda.</Text>
      ) : (
        <FlatList data={favorites} keyExtractor={(item) => item.id} renderItem={renderItem} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, marginBottom: 10, borderRadius: 8 },
  flag: { width: 50, height: 35, marginRight: 12, borderRadius: 4 },
  name: { fontSize: 18, fontWeight: '500' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#666' },
});