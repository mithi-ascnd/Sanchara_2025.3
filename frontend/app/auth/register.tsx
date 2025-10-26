import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import AccessibilityInput from '../../components/AccessibilityInput';
import AccessibilityButton from '../../components/AccessibilityButton';
import VoiceAgent from '../../components/VoiceAgent';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

export default function Register() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedMode, setSelectedMode] = useState<'mobility' | 'vision' | 'hearing' | null>(null);
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Welcome message with text-to-speech
    const welcomeMessage = "Welcome to Sanchara! Let's create your account. I'll guide you through the process. You can speak your information or type it manually.";
    Speech.speak(welcomeMessage, {
      language: 'en',
      pitch: 1.0,
      rate: 0.8,
      quality: Speech.VoiceQuality.Enhanced,
    });
  }, []);

  const handleVoiceRegistration = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Parse full name
    if (lowerText.includes('my name is') || lowerText.includes('i am') || lowerText.includes('call me')) {
      const nameMatch = text.match(/(?:my name is|i am|call me)\s+(.+)/i);
      if (nameMatch) {
        setFullName(nameMatch[1].trim());
        Speech.speak(`Got it, your name is ${nameMatch[1].trim()}. What's your email address?`);
      }
    }
    
    // Parse email
    if (lowerText.includes('email') || lowerText.includes('@')) {
      const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
      if (emailMatch) {
        setEmail(emailMatch[1]);
        Speech.speak(`Email recorded: ${emailMatch[1]}. What would you like your password to be?`);
      }
    }
    
    // Parse password
    if (lowerText.includes('password') || lowerText.includes('pass')) {
      const passwordMatch = text.match(/(?:password|pass)\s+(?:is\s+)?(\w+)/i);
      if (passwordMatch) {
        setPassword(passwordMatch[1]);
        setConfirmPassword(passwordMatch[1]);
        Speech.speak(`Password set. Now, what accessibility needs do you have? Say mobility, vision, or hearing.`);
      }
    }
    
    // Parse accessibility mode
    if (lowerText.includes('mobility') || lowerText.includes('wheelchair')) {
      setSelectedMode('mobility');
      Speech.speak('Mobility mode selected. Perfect! Now let me create your account.');
    } else if (lowerText.includes('vision') || lowerText.includes('blind')) {
      setSelectedMode('vision');
      Speech.speak('Vision mode selected. Perfect! Now let me create your account.');
    } else if (lowerText.includes('hearing') || lowerText.includes('deaf')) {
      setSelectedMode('hearing');
      Speech.speak('Hearing mode selected. Perfect! Now let me create your account.');
    }
    
    // Auto-register if all fields are filled
    if (fullName && email && password && selectedMode) {
      setTimeout(() => {
        handleRegister();
      }, 1000);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      Speech.speak('Please fill in all fields before continuing.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      Speech.speak('Passwords do not match. Please try again.');
      return;
    }

    if (!selectedMode) {
      Alert.alert('Error', 'Please select your accessibility needs');
      Speech.speak('Please select your accessibility needs: mobility, vision, or hearing.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password, selectedMode);
      Speech.speak('Account created successfully! Welcome to Sanchara!');
    } catch (error) {
      Alert.alert('Registration Failed', 'Please try again');
      Speech.speak('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceMode = () => {
    setVoiceMode(!voiceMode);
    if (!voiceMode) {
      Speech.speak('Voice registration enabled. You can now speak your information.');
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
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
                accessible={true}
                accessibilityLabel="Go back"
                accessibilityHint="Double tap to return to previous screen"
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.voiceButton}
                onPress={toggleVoiceMode}
                accessible={true}
                accessibilityLabel="Toggle voice guidance"
                accessibilityHint="Double tap to enable voice guidance"
              >
                <Ionicons name="chatbubble" size={24} color={voiceMode ? "#00D4AA" : "#666"} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Let's get started</Text>
              <Text style={styles.emoji}>👋</Text>
            </View>
            
            <Text style={styles.subtitle}>
              Create an account to personalize your experience. Tap the narrator icon above to begin voice guidance.
            </Text>

            {/* Voice Agent */}
            {voiceMode && (
              <View style={styles.voiceAgentContainer}>
                <VoiceAgent
                  mode="conversation"
                  onTextReceived={handleVoiceRegistration}
                  isEnabled={true}
                />
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              <AccessibilityInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
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
                secureTextEntry={!showPassword}
                accessibilityLabel="Password input"
                accessibilityHint="Enter your password"
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                }
              />

              <AccessibilityInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                accessibilityLabel="Confirm password input"
                accessibilityHint="Confirm your password"
                rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            {/* Accessibility Mode Selection */}
            <View style={styles.modeContainer}>
              <Text style={styles.modeTitle}>Your Needs?</Text>
              <Text style={styles.modeSubtitle}>Tell us about your needs so we can filter the map for you</Text>
              
              <View style={styles.modeOptions}>
                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    selectedMode === 'mobility' && styles.modeCardSelected
                  ]}
                  onPress={() => setSelectedMode('mobility')}
                  accessible={true}
                  accessibilityLabel="Mobility accessibility needs"
                  accessibilityHint="Select if you have mobility accessibility needs"
                >
                  <Ionicons 
                    name="accessibility" 
                    size={32} 
                    color={selectedMode === 'mobility' ? '#fff' : '#00D4AA'} 
                  />
                  <Text style={[
                    styles.modeText,
                    selectedMode === 'mobility' && styles.modeTextSelected
                  ]}>
                    Mobility
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    selectedMode === 'vision' && styles.modeCardSelected
                  ]}
                  onPress={() => setSelectedMode('vision')}
                  accessible={true}
                  accessibilityLabel="Vision accessibility needs"
                  accessibilityHint="Select if you have vision accessibility needs"
                >
                  <Ionicons 
                    name="eye" 
                    size={32} 
                    color={selectedMode === 'vision' ? '#fff' : '#FF6B6B'} 
                  />
                  <Text style={[
                    styles.modeText,
                    selectedMode === 'vision' && styles.modeTextSelected
                  ]}>
                    Vision
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    selectedMode === 'hearing' && styles.modeCardSelected
                  ]}
                  onPress={() => setSelectedMode('hearing')}
                  accessible={true}
                  accessibilityLabel="Hearing accessibility needs"
                  accessibilityHint="Select if you have hearing accessibility needs"
                >
                  <Ionicons 
                    name="ear" 
                    size={32} 
                    color={selectedMode === 'hearing' ? '#fff' : '#4ECDC4'} 
                  />
                  <Text style={[
                    styles.modeText,
                    selectedMode === 'hearing' && styles.modeTextSelected
                  ]}>
                    Hearing
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Introduction</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
              <Text style={styles.progressNumber}>3/3</Text>
            </View>

            {/* Register Button */}
            <AccessibilityButton
              onPress={handleRegister}
              title={loading ? 'Creating Account...' : 'Continue'}
              icon="arrow-forward"
              disabled={loading}
              size="large"
              accessibilityLabel="Create account button"
              accessibilityHint="Double tap to create your account"
              style={styles.registerButton}
            />

            {/* Login Link */}
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => router.push('/auth/login')}
              accessible={true}
              accessibilityLabel="Already have an account"
              accessibilityHint="Double tap to go to login screen"
            >
              <Text style={styles.linkText}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  voiceButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 12,
  },
  emoji: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    marginBottom: 32,
  },
  voiceAgentContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  modeContainer: {
    marginBottom: 32,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  modeSubtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 24,
    lineHeight: 22,
  },
  modeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modeCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeCardSelected: {
    backgroundColor: '#00D4AA',
    borderColor: '#00D4AA',
  },
  modeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  modeTextSelected: {
    color: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
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
  registerButton: {
    marginBottom: 24,
  },
  linkButton: {
    alignItems: 'center',
    padding: 16,
  },
  linkText: {
    color: '#00D4AA',
    fontSize: 16,
    fontWeight: '500',
  },
});