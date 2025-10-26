import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import AccessibilityInput from '../../components/AccessibilityInput';
import AccessibilityButton from '../../components/AccessibilityButton';
import VoiceAgent from '../../components/VoiceAgent';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

export default function Login() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [welcomeSpoken, setWelcomeSpoken] = useState(false);

  useEffect(() => {
    // Welcome message with text-to-speech
    if (!welcomeSpoken) {
      const welcomeMessage = "Welcome back to Sanchara! You can login using voice commands or manually. Tap the voice button to speak your credentials.";
      Speech.speak(welcomeMessage, {
        language: 'en',
        pitch: 1.0,
        rate: 0.8,
        quality: Speech.VoiceQuality.Enhanced,
      });
      setWelcomeSpoken(true);
    }
  }, [welcomeSpoken]);

  const handleVoiceAuth = (voiceUsername: string, voicePassword: string) => {
    setUsername(voiceUsername);
    setPassword(voicePassword);
    setVoiceMode(false);
    // Auto-login after voice input
    setTimeout(() => {
      handleLogin();
    }, 500);
  };

  const toggleVoiceMode = () => {
    setVoiceMode(!voiceMode);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      // Navigation handled by index.tsx
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a', '#1a1a1a']}
        style={styles.gradient}
      >
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
            <View style={styles.logoContainer}>
              <Ionicons name="log-in" size={80} color="#4CAF50" />
              <View style={styles.logoGlow} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue your journey</Text>
            
            {/* Voice Login Option */}
            <TouchableOpacity 
              style={styles.voiceLoginButton}
              onPress={toggleVoiceMode}
              accessible={true}
              accessibilityLabel="Login with voice"
              accessibilityHint="Double tap to enable voice login mode"
            >
              <Ionicons name="mic" size={20} color="#00D4AA" />
              <Text style={styles.voiceLoginText}>
                {voiceMode ? 'Voice Login Active' : 'Login with Voice'}
              </Text>
            </TouchableOpacity>
          </View>

          {voiceMode ? (
            <View style={styles.voiceModeContainer}>
              <Text style={styles.voiceModeTitle}>Voice Login</Text>
              <Text style={styles.voiceModeSubtitle}>
                Say your username and password. For example: "username is john" and "password is mypass123"
              </Text>
              
              <View style={styles.voiceAgentContainer}>
                <VoiceAgent
                  mode="auth"
                  onAuthData={handleVoiceAuth}
                  isEnabled={true}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.backToManualButton}
                onPress={toggleVoiceMode}
                accessible={true}
                accessibilityLabel="Back to manual login"
                accessibilityHint="Double tap to return to manual login form"
              >
                <Text style={styles.backToManualText}>Back to Manual Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <AccessibilityInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                autoCapitalize="none"
                accessibilityLabel="Username input"
                accessibilityHint="Enter your username to login"
              />

              <AccessibilityInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                accessibilityLabel="Password input"
                accessibilityHint="Enter your password to login"
              />

              <AccessibilityButton
                onPress={handleLogin}
                title={loading ? 'Logging in...' : 'Login'}
                icon="log-in"
                disabled={loading}
                size="large"
                accessibilityLabel="Login button"
                accessibilityHint="Double tap to login to your account"
                style={styles.loginButton}
              />

              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => router.push('/auth/register')}
                accessible={true}
                accessibilityLabel="Create new account"
                accessibilityHint="Double tap to create a new account"
              >
                <Text style={styles.linkText}>Don't have an account? Register</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    marginBottom: 24,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logoGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#4CAF50',
    opacity: 0.2,
    borderRadius: 50,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  form: {
    gap: 20,
  },
  loginButton: {
    marginTop: 16,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
  },
  linkText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  voiceLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.3)',
    marginTop: 16,
  },
  voiceLoginText: {
    color: '#00D4AA',
    fontSize: 16,
    fontWeight: '500',
  },
  voiceModeContainer: {
    alignItems: 'center',
    gap: 24,
  },
  voiceModeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  voiceModeSubtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  voiceAgentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  backToManualButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backToManualText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});