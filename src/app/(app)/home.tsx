import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAllCountries, getCountryByName } from '../services/countriesApi';

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialCountries();
  }, []);

  const loadInitialCountries = async () => {
    setLoading(true);
    try {
      const response = await getAllCountries();
      setCountries(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      loadInitialCountries();
      return;
    }
    setLoading(true);
    try {
      const response = await getCountryByName(search);
      setCountries(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) setCountries([]);
      else console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCountryPress = (countryCode: string) => {
    // Solução: usar objeto com pathname e params
    router.push({
      pathname: '/details/[code]',
      params: { code: countryCode }
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleCountryPress(item.cca3)}
    >
      <Image source={{ uri: item.flags?.png }} style={styles.flag} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name?.common}</Text>
        <Text style={styles.capital}>Capital: {item.capital?.[0] || 'N/A'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Digite um país..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={countries}
          keyExtractor={(item) => item.cca3}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  searchBox: { flexDirection: 'row', marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: '#fff' },
  searchButton: { marginLeft: 8, backgroundColor: '#007AFF', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  flag: { width: 50, height: 35, marginRight: 12, borderRadius: 4 },
  textContainer: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  capital: { fontSize: 14, color: '#555' },
});