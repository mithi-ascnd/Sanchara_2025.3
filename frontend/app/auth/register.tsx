import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import AccessibilityInput from '../../components/AccessibilityInput';
import AccessibilityButton from '../../components/AccessibilityButton';
import { LinearGradient } from 'expo-linear-gradient';

export default function Register() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'blind' | 'deaf' | 'wheelchair'>('wheelchair');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password, mode);
      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      Alert.alert('Registration Failed', 'Username may already exist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scroll}>
          <View style={styles.content}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              accessible={true}
              accessibilityLabel="Go back"
              accessibilityHint="Double tap to return to previous screen"
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Let's get started 👋</Text>
              <Text style={styles.subtitle}>
                Create an account to personalize your experience. Tap the narrator icon above to begin voice guidance.
              </Text>
              <TouchableOpacity style={styles.narratorButton}>
                <Ionicons name="chatbubbles" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <AccessibilityInput
                label="Full Name"
                value={username}
                onChangeText={setUsername}
                placeholder="Full Name"
                autoCapitalize="words"
                accessibilityLabel="Full name input"
                accessibilityHint="Enter your full name"
              />

              <AccessibilityInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                accessibilityLabel="Email address input"
                accessibilityHint="Enter your email address"
              />

              <AccessibilityInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                accessibilityLabel="Password input"
                accessibilityHint="Create a secure password"
              />

              <View style={styles.modeSection}>
                <Text style={styles.sectionTitle}>Your Needs?</Text>
                <Text style={styles.sectionSubtitle}>
                  Tell us about your needs so we can filter the map for you
                </Text>
                
                <View style={styles.modeGrid}>
                  <TouchableOpacity
                    style={[styles.modeCard, mode === 'wheelchair' && styles.modeCardActive]}
                    onPress={() => setMode('wheelchair')}
                    accessible={true}
                    accessibilityLabel="Mobility accessibility mode"
                    accessibilityHint="Select for wheelchair and mobility accessibility features"
                  >
                    <Ionicons 
                      name="accessibility" 
                      size={32} 
                      color={mode === 'wheelchair' ? '#fff' : '#00D4AA'} 
                    />
                    <Text style={[styles.modeText, mode === 'wheelchair' && styles.modeTextActive]}>
                      Mobility
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modeCard, mode === 'blind' && styles.modeCardActive]}
                    onPress={() => setMode('blind')}
                    accessible={true}
                    accessibilityLabel="Vision accessibility mode"
                    accessibilityHint="Select for vision and audio accessibility features"
                  >
                    <Ionicons 
                      name="eye" 
                      size={32} 
                      color={mode === 'blind' ? '#fff' : '#FF6B6B'} 
                    />
                    <Text style={[styles.modeText, mode === 'blind' && styles.modeTextActive]}>
                      Vision
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modeCard, mode === 'deaf' && styles.modeCardActive]}
                    onPress={() => setMode('deaf')}
                    accessible={true}
                    accessibilityLabel="Hearing accessibility mode"
                    accessibilityHint="Select for hearing and visual accessibility features"
                  >
                    <Ionicons 
                      name="ear" 
                      size={32} 
                      color={mode === 'deaf' ? '#fff' : '#4ECDC4'} 
                    />
                    <Text style={[styles.modeText, mode === 'deaf' && styles.modeTextActive]}>
                      Hearing
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>Introduction</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '100%' }]} />
                </View>
                <Text style={styles.progressNumber}>3/3</Text>
              </View>

              <AccessibilityButton
                onPress={handleRegister}
                title={loading ? 'Creating account...' : 'Continue'}
                icon="arrow-forward"
                disabled={loading}
                size="large"
                backgroundColor="#00D4AA"
                accessibilityLabel="Create account"
                accessibilityHint="Double tap to create your account"
                style={styles.continueButton}
              />

              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => router.push('/auth/login')}
                accessible={true}
                accessibilityLabel="Already have an account"
                accessibilityHint="Double tap to login instead"
              >
                <Text style={styles.linkText}>Already have an account? Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
    position: 'relative',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  narratorButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    gap: 24,
  },
  modeSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  modeCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeCardActive: {
    backgroundColor: 'rgba(0, 212, 170, 0.2)',
    borderColor: '#00D4AA',
  },
  modeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  modeTextActive: {
    color: '#00D4AA',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D4AA',
    borderRadius: 2,
  },
  progressNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  continueButton: {
    marginTop: 20,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  linkText: {
    color: '#00D4AA',
    fontSize: 16,
    fontWeight: '500',
  },
});