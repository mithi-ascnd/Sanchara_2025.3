import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Report() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [location, setLocation] = useState<any>(null);
  const [barrierType, setBarrierType] = useState('pothole');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      }
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll permission is needed');
      return;
    }

    const result = await ImagePicker.launchImagePickerAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhoto(result.assets[0].base64);
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/barriers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.user_id,
          latitude: location.latitude,
          longitude: location.longitude,
          barrier_type: barrierType,
          severity: severity,
          description: description,
          photo_base64: photo ? `data:image/jpeg;base64,${photo}` : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          'Success',
          `Barrier reported successfully!${data.ai_classification ? ` AI detected: ${data.ai_classification}` : ''}`,
          [
            { text: 'OK', onPress: () => router.back() }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to report barrier');
      }
    } catch (error) {
      console.error('Report error:', error);
      Alert.alert('Error', 'Failed to submit report');
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
            <Ionicons name="warning" size={64} color={isDeafMode ? "#000" : "#FF9800"} />
            <Text style={[styles.title, isDeafMode && styles.titleDeaf]}>
              {isDeafMode ? '⚠️ REPORT BARRIER' : 'Report Barrier'}
            </Text>
            <Text style={[styles.subtitle, isDeafMode && styles.subtitleDeaf]}>
              {isDeafMode ? 'HELP THE COMMUNITY' : 'Help improve accessibility for everyone'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDeafMode && styles.labelDeaf]}>
                {isDeafMode ? '🚧 BARRIER TYPE' : 'Barrier Type'}
              </Text>
              <View style={styles.typeSelector}>
                {['pothole', 'missing_ramp', 'stairs', 'construction', 'curb'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      isDeafMode && styles.typeButtonDeaf,
                      barrierType === type && styles.typeButtonActive,
                      isDeafMode && barrierType === type && styles.typeButtonActiveDeaf,
                    ]}
                    onPress={() => setBarrierType(type)}
                  >
                    <Text style={[
                      styles.typeText,
                      isDeafMode && styles.typeTextDeaf,
                      barrierType === type && styles.typeTextActive,
                      isDeafMode && barrierType === type && styles.typeTextActiveDeaf,
                    ]}>
                      {type.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDeafMode && styles.labelDeaf]}>
                {isDeafMode ? '⚠️ SEVERITY' : 'Severity'}
              </Text>
              <View style={styles.severitySelector}>
                {[{ value: 'low', color: '#4CAF50', label: isDeafMode ? '✅ LOW' : 'Low' },
                  { value: 'medium', color: '#FF9800', label: isDeafMode ? '⚠️ MEDIUM' : 'Medium' },
                  { value: 'high', color: '#F44336', label: isDeafMode ? '🛑 HIGH' : 'High' }].map((sev) => (
                  <TouchableOpacity
                    key={sev.value}
                    style={[
                      styles.severityButton,
                      isDeafMode && styles.severityButtonDeaf,
                      severity === sev.value && { backgroundColor: sev.color },
                      isDeafMode && severity === sev.value && styles.severityButtonActiveDeaf,
                    ]}
                    onPress={() => setSeverity(sev.value)}
                  >
                    <Text style={[
                      styles.severityText,
                      isDeafMode && styles.severityTextDeaf,
                      severity === sev.value && styles.severityTextActive,
                    ]}>
                      {sev.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDeafMode && styles.labelDeaf]}>
                {isDeafMode ? '📝 DESCRIPTION' : 'Description'}
              </Text>
              <TextInput
                style={[styles.input, isDeafMode && styles.inputDeaf]}
                value={description}
                onChangeText={setDescription}
                placeholder={isDeafMode ? "DESCRIBE THE BARRIER..." : "Describe the barrier..."}
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDeafMode && styles.labelDeaf]}>
                {isDeafMode ? '📷 PHOTO (OPTIONAL)' : 'Photo (Optional)'}
              </Text>
              <TouchableOpacity 
                style={[styles.photoButton, isDeafMode && styles.photoButtonDeaf]}
                onPress={pickImage}
              >
                {photo ? (
                  <Image 
                    source={{ uri: `data:image/jpeg;base64,${photo}` }} 
                    style={styles.photoPreview}
                  />
                ) : (
                  <>
                    <Ionicons name="camera" size={48} color={isDeafMode ? "#000" : "#4CAF50"} />
                    <Text style={[styles.photoText, isDeafMode && styles.photoTextDeaf]}>
                      {isDeafMode ? 'TAP TO ADD PHOTO' : 'Tap to add photo'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              {photo && (
                <TouchableOpacity onPress={() => setPhoto(null)}>
                  <Text style={[styles.removePhoto, isDeafMode && styles.removePhotoDeaf]}>
                    {isDeafMode ? '❌ REMOVE PHOTO' : 'Remove photo'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity 
              style={[
                styles.button,
                loading && styles.buttonDisabled,
                isDeafMode && styles.buttonDeaf,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={[styles.buttonText, isDeafMode && styles.buttonTextDeaf]}>
                {loading ? (isDeafMode ? '⏳ SUBMITTING...' : 'Submitting...') : (isDeafMode ? '✅ SUBMIT REPORT' : 'Submit Report')}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.note, isDeafMode && styles.noteDeaf]}>
              {isDeafMode ? '🔒 YOUR LOCATION AND PHOTO WILL BE SHARED' : 'Note: Your current location and photo will be shared with the community to help others'}
            </Text>
          </View>
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
    gap: 12,
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
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  typeButtonDeaf: {
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#000',
  },
  typeButtonActive: {
    backgroundColor: '#FF9800',
  },
  typeButtonActiveDeaf: {
    backgroundColor: '#FF9800',
    borderWidth: 3,
  },
  typeText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  typeTextDeaf: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  typeTextActive: {
    color: '#fff',
  },
  typeTextActiveDeaf: {
    color: '#000',
    fontWeight: '900',
  },
  severitySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  severityButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  severityButtonDeaf: {
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#000',
  },
  severityButtonActiveDeaf: {
    borderWidth: 4,
  },
  severityText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '500',
  },
  severityTextDeaf: {
    color: '#000',
    fontWeight: 'bold',
  },
  severityTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
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
  photoButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4CAF50',
  },
  photoButtonDeaf: {
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: '#000',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  photoText: {
    color: '#4CAF50',
    fontSize: 16,
    marginTop: 12,
  },
  photoTextDeaf: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'black',
  },
  removePhoto: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  removePhotoDeaf: {
    fontSize: 16,
    fontWeight: 'black',
  },
  button: {
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDeaf: {
    backgroundColor: '#FF9800',
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
  note: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 18,
  },
  noteDeaf: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
});