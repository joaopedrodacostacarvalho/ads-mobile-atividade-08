import { router, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getAllCountries, getCountryByName } from "../../services/countriesApi";

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const [countries, setCountries] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", marginRight: 16 }}>
          <TouchableOpacity
            onPress={() => router.push("/favorites")}
            style={{ marginRight: 16 }}
          >
            <Text style={{ fontSize: 24 }}>⭐</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Text style={{ fontSize: 24 }}>👤</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (!search.trim()) setFiltered(countries);
    else
      setFiltered(
        countries.filter((c) =>
          c.name.common.toLowerCase().includes(search.toLowerCase()),
        ),
      );
  }, [search, countries]);

  const loadCountries = async () => {
    setLoading(true);
    try {
      const res = await getAllCountries([
        "name",
        "capital",
        "flags",
        "cca3",
        "population",
      ]);
      setCountries(res.data);
      setFiltered(res.data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os países");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return loadCountries();
    setLoading(true);
    try {
      const res = await getCountryByName(search);
      setCountries(res.data);
      setFiltered(res.data);
    } catch (error: any) {
      if (error.response?.status === 404) Alert.alert("Nenhum país encontrado");
      else Alert.alert("Erro", "Falha na busca");
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Buscar país..."
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
          data={filtered}
          keyExtractor={(item) => item.cca3}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/details/[code]",
                  params: { code: item.cca3 },
                })
              }
            >
              <Image source={{ uri: item.flags?.png }} style={styles.flag} />
              <View>
                <Text style={styles.name}>{item.name.common}</Text>
                <Text>Capital: {item.capital?.[0] || "N/A"}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  searchBox: { flexDirection: "row", marginBottom: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  buttonText: { color: "#fff" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  flag: { width: 60, height: 40, marginRight: 12, borderRadius: 6 },
  name: { fontSize: 18, fontWeight: "bold" },
});
