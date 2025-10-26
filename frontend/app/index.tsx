import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, StatusBar, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import VoiceAgent from '../components/VoiceAgent';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, loadUser, user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [voiceAgentEnabled, setVoiceAgentEnabled] = useState(true);
  const [welcomeSpoken, setWelcomeSpoken] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  // Welcome message with text-to-speech
  useEffect(() => {
    if (!welcomeSpoken && !isLoading) {
      const welcomeMessage = "Welcome to Sanchara! Your accessibility navigation companion. I'm here to help you explore the world with confidence. You can speak to me anytime or use the touch controls.";
      Speech.speak(welcomeMessage, {
        language: 'en',
        pitch: 1.0,
        rate: 0.8,
        quality: Speech.VoiceQuality.Enhanced,
      });
      setWelcomeSpoken(true);
    }
  }, [isLoading, welcomeSpoken]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Navigate to appropriate mode
        if (user.mode === 'blind') {
          router.replace('/blind/navigation');
        } else if (user.mode === 'deaf') {
          router.replace('/deaf/navigation');
        } else {
          router.replace('/wheelchair/navigation');
        }
      }
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D4AA" />
        <Text style={styles.loadingText}>Loading Sanchara...</Text>
      </View>
    );
  }

  const onboardingSteps = [
    {
      title: "Navigate with confidence",
      subtitle: "Discover accessible routes and never lose your way. Sanchara guides you through every step of your journey.",
      illustration: "navigate-circle",
      color: "#00D4AA",
      features: ["Real-time navigation", "Accessibility alerts", "Voice guidance"]
    },
    {
      title: "Accessibility scores everywhere",
      subtitle: "Get instant accessibility ratings for any location. Know before you go with our comprehensive scoring system.",
      illustration: "star",
      color: "#4ECDC4",
      features: ["Location scoring", "Feature detection", "User reports"]
    },
    {
      title: "Your personal AI assistant",
      subtitle: "Meet Sanchara, your voice-enabled accessibility companion. Ask questions, get directions, and explore with confidence.",
      illustration: "chatbubble-ellipses",
      color: "#FF6B6B",
      features: ["Voice commands", "Conversational AI", "Smart assistance"]
    }
  ];

  const currentStepData = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/auth/register');
    }
  };

  const handleSkip = () => {
    router.push('/auth/login');
  };

  const handleVoiceInput = (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('get started') || lowerText.includes('continue') || lowerText.includes('next')) {
      handleNext();
    } else if (lowerText.includes('skip') || lowerText.includes('login')) {
      handleSkip();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.time}>9:41</Text>
            <View style={styles.statusIcons}>
              <Ionicons name="cellular" size={16} color="#fff" />
              <Ionicons name="wifi" size={16} color="#fff" />
              <Ionicons name="battery-full" size={16} color="#fff" />
            </View>
          </View>
          {currentStep < onboardingSteps.length - 1 && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={[styles.illustrationCircle, { backgroundColor: currentStepData.color }]}>
              <Ionicons 
                name={currentStepData.illustration as any} 
                size={80} 
                color="#fff" 
              />
            </View>
            {currentStep === 0 && (
              <View style={styles.floatingElements}>
                <View style={[styles.floatingPin, { backgroundColor: '#FF6B6B' }]}>
                  <Ionicons name="location" size={20} color="#fff" />
                </View>
                <View style={[styles.floatingPath, { backgroundColor: '#4ECDC4' }]}>
                  <View style={styles.pathDots}>
                    <View style={styles.pathDot} />
                    <View style={styles.pathDot} />
                    <View style={styles.pathDot} />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
            
            {/* Features List */}
            <View style={styles.featuresContainer}>
              {currentStepData.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={currentStepData.color} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Introduction</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressNumber}>{currentStep + 1}/3</Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: currentStepData.color }]}
            onPress={handleNext}
            accessible={true}
            accessibilityLabel={currentStep === onboardingSteps.length - 1 ? "Explore the app" : "Continue"}
            accessibilityHint="Double tap to continue"
          >
            <Text style={styles.actionButtonText}>
              {currentStep === onboardingSteps.length - 1 ? "Explore the Map" : "Get Started"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Voice Agent */}
        {voiceAgentEnabled && (
          <View style={styles.voiceAgentContainer}>
            <VoiceAgent
              onTextReceived={handleVoiceInput}
              isEnabled={voiceAgentEnabled}
              mode="conversation"
            />
          </View>
        )}
      </LinearGradient>
    </View>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '500',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  time: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  skipButton: {
    alignSelf: 'flex-end',
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    position: 'relative',
    marginBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  floatingElements: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  floatingPin: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingPath: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    width: 60,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pathDots: {
    flexDirection: 'row',
    gap: 4,
  },
  pathDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresContainer: {
    marginTop: 16,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
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
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  voiceAgentContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    alignItems: 'center',
  },
});