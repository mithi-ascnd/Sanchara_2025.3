import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Search() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      }
    })();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    if (!location) {
      alert('Location not available');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/ai/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          user_mode: user?.mode || 'wheelchair',
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 5000,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDeafMode = user?.mode === 'deaf';

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isDeafMode && styles.containerDeaf]}
    >
      <ScrollView style={styles.scroll}>
        <View style={styles.content}>
          <TouchableOpacity 
            style={[styles.backButton, isDeafMode && styles.backButtonDeaf]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={isDeafMode ? "#000" : "#fff"} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="search" size={64} color={isDeafMode ? "#000" : "#4CAF50"} />
            <Text style={[styles.title, isDeafMode && styles.titleDeaf]}>
              {isDeafMode ? '🔍 AI SEARCH' : 'AI Search'}
            </Text>
            <Text style={[styles.subtitle, isDeafMode && styles.subtitleDeaf]}>
              {isDeafMode ? 'FIND ACCESSIBLE PLACES' : 'Find accessible places naturally'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDeafMode && styles.labelDeaf]}>
                {isDeafMode ? '💬 WHAT ARE YOU LOOKING FOR?' : 'What are you looking for?'}
              </Text>
              <TextInput
                style={[styles.input, isDeafMode && styles.inputDeaf]}
                value={query}
                onChangeText={setQuery}
                placeholder={isDeafMode ? "TYPE YOUR SEARCH..." : "e.g., quiet café with ramp and Wi-Fi"}
                placeholderTextColor={isDeafMode ? "#666" : "#666"}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.examples}>
              <Text style={[styles.examplesTitle, isDeafMode && styles.examplesTitleDeaf]}>
                {isDeafMode ? '💡 EXAMPLES:' : 'Example queries:'}
              </Text>
              <TouchableOpacity onPress={() => setQuery("Find a café with wheelchair ramp and elevator within 1km")}>
                <Text style={[styles.exampleText, isDeafMode && styles.exampleTextDeaf]}>
                  {isDeafMode ? '• CAFÉ WITH RAMP' : '• "Find a café with wheelchair ramp"'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setQuery("Accessible park with smooth paths and benches")}>
                <Text style={[styles.exampleText, isDeafMode && styles.exampleTextDeaf]}>
                  {isDeafMode ? '• PARK WITH SMOOTH PATHS' : '• "Accessible park with smooth paths"'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setQuery("Restaurant with good lighting and visual menus")}>
                <Text style={[styles.exampleText, isDeafMode && styles.exampleTextDeaf]}>
                  {isDeafMode ? '• RESTAURANT WITH GOOD LIGHTING' : '• "Restaurant with good lighting"'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled, isDeafMode && styles.buttonDeaf]}
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={isDeafMode ? "#000" : "#fff"} />
              ) : (
                <Text style={[styles.buttonText, isDeafMode && styles.buttonTextDeaf]}>
                  {isDeafMode ? '🔍 SEARCH NOW' : 'Search'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {result && (
            <View style={[styles.result, isDeafMode && styles.resultDeaf]}>
              <View style={styles.resultHeader}>
                <Ionicons name="bulb" size={32} color={isDeafMode ? "#000" : "#4CAF50"} />
                <Text style={[styles.resultTitle, isDeafMode && styles.resultTitleDeaf]}>
                  {isDeafMode ? '✅ RESULTS' : 'Search Results'}
                </Text>
              </View>
              <Text style={[styles.resultText, isDeafMode && styles.resultTextDeaf]}>
                {result.response}
              </Text>
              <Text style={[styles.resultMeta, isDeafMode && styles.resultMetaDeaf]}>
                {isDeafMode ? `📍 ${result.locations_found} LOCATIONS FOUND` : `Found ${result.locations_found} nearby locations`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  containerDeaf: {
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 24,
  },
  backButtonDeaf: {},
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  titleDeaf: {
    color: '#000',
    fontSize: 36,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 8,
    textAlign: 'center',
  },
  subtitleDeaf: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  labelDeaf: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'black',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputDeaf: {
    backgroundColor: '#f0f0f0',
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    borderWidth: 3,
    borderColor: '#000',
  },
  examples: {
    gap: 8,
  },
  examplesTitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
  },
  examplesTitleDeaf: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'black',
  },
  exampleText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
  },
  exampleTextDeaf: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDeaf: {
    backgroundColor: '#FFD700',
    borderWidth: 4,
    borderColor: '#000',
    paddingVertical: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextDeaf: {
    color: '#000',
    fontSize: 20,
    fontWeight: '900',
  },
  result: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
  },
  resultDeaf: {
    backgroundColor: '#f0f0f0',
    borderWidth: 4,
    borderColor: '#000',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultTitleDeaf: {
    color: '#000',
    fontSize: 24,
    fontWeight: '900',
  },
  resultText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    marginBottom: 12,
  },
  resultTextDeaf: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  resultMeta: {
    fontSize: 14,
    color: '#4CAF50',
  },
  resultMetaDeaf: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'black',
  },
});