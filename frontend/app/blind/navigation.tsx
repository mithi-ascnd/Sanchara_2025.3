import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function BlindNavigation() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [location, setLocation] = useState<any>(null);
  const [listening, setListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [navigationActive, setNavigationActive] = useState(false);
  const [nearbyBarriers, setNearbyBarriers] = useState([]);
  const isSpeaking = useRef(false);

  useEffect(() => {
    initializeBlindMode();
    return () => {
      Speech.stop();
    };
  }, []);

  const initializeBlindMode = async () => {
    // Request permissions
    await Location.requestForegroundPermissionsAsync();
    await Audio.requestPermissionsAsync();

    // Get location
    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);

    // Welcome message
    speak('Welcome to Sanchara Blind Mode. Voice navigation activated. Say search to find locations, or report to report a barrier.');

    // Fetch nearby barriers
    fetchNearbyBarriers(currentLocation.coords.latitude, currentLocation.coords.longitude);

    // Start location tracking
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (newLocation) => {
        setLocation(newLocation.coords);
        checkProximityAlerts(newLocation.coords);
      }
    );
  };

  const speak = async (text: string) => {
    if (isSpeaking.current) {
      Speech.stop();
    }
    isSpeaking.current = true;
    await Speech.speak(text, {
      language: 'en',
      pitch: 1.0,
      rate: 0.9,
      onDone: () => {
        isSpeaking.current = false;
      },
      onError: () => {
        isSpeaking.current = false;
      }
    });
  };

  const fetchNearbyBarriers = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `${API_URL}/api/barriers?latitude=${lat}&longitude=${lng}&radius=500`
      );
      const data = await response.json();
      setNearbyBarriers(data);
    } catch (error) {
      console.error('Error fetching barriers:', error);
    }
  };

  const checkProximityAlerts = (coords: any) => {
    // Check if approaching any barriers
    nearbyBarriers.forEach((barrier: any) => {
      const distance = calculateDistance(
        coords.latitude,
        coords.longitude,
        barrier.latitude,
        barrier.longitude
      );

      if (distance < 50) {
        speak(`Warning! ${barrier.barrier_type} detected 50 meters ahead. Severity: ${barrier.severity}`);
      }
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleVoiceCommand = (command: string) => {
    const cmd = command.toLowerCase();

    if (cmd.includes('search')) {
      speak('Opening AI search. What location are you looking for?');
      router.push('/search');
    } else if (cmd.includes('report')) {
      speak('Opening barrier report. Please describe the barrier.');
      router.push('/report');
    } else if (cmd.includes('profile')) {
      speak('Opening profile settings.');
      router.push('/profile');
    } else if (cmd.includes('logout')) {
      speak('Logging out. Goodbye.');
      handleLogout();
    } else if (cmd.includes('navigate')) {
      speak('Navigation mode activated. Where would you like to go?');
      setNavigationActive(true);
    } else {
      speak('Command not recognized. Available commands are: search, report, navigate, profile, or logout.');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  // Simulate voice recognition (in production, use expo-speech-recognition or similar)
  const startListening = () => {
    setListening(true);
    speak('Listening...');
    
    // Simulate voice input after 2 seconds
    setTimeout(() => {
      setListening(false);
      speak('Say a command: search, report, navigate, profile, or logout');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="volume-high" size={56} color="#2196F3" />
          <View style={styles.iconPulse} />
        </View>
        <Text style={styles.title}>Blind Mode</Text>
        <Text style={styles.subtitle}>Voice Navigation Active</Text>
        <Text style={styles.statusIndicator}>🎤 Ready to listen</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.micContainer}>
            <Ionicons 
              name={listening ? "mic" : "mic-off"} 
              size={80} 
              color={listening ? "#4CAF50" : "#666"} 
            />
            {listening && <View style={styles.listeningRing} />}
          </View>
          <Text style={styles.statusText}>
            {listening ? 'Listening to your command...' : 'Tap to speak a command'}
          </Text>
          <Text style={styles.statusSubtext}>
            {listening ? 'Speak clearly into your device' : 'Voice commands available'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.voiceButton, listening && styles.voiceButtonActive]}
          onPress={startListening}
          accessible={true}
          accessibilityLabel="Voice command button"
          accessibilityHint="Double tap to speak a voice command"
          accessibilityRole="button"
        >
          <Ionicons name="mic" size={48} color="#fff" />
          <Text style={styles.voiceButtonText}>
            {listening ? 'Listening...' : 'Speak Command'}
          </Text>
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions (Voice Commands)</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleVoiceCommand('search')}
            accessible={true}
            accessibilityLabel="Search for locations"
            accessibilityHint="Double tap to search for accessible locations"
          >
            <View style={styles.actionIcon}>
              <Ionicons name="search" size={32} color="#2196F3" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionText}>Search</Text>
              <Text style={styles.actionSubtext}>Say "search" to find places</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleVoiceCommand('report')}
            accessible={true}
            accessibilityLabel="Report a barrier"
            accessibilityHint="Double tap to report accessibility barriers"
          >
            <View style={styles.actionIcon}>
              <Ionicons name="warning" size={32} color="#FF9800" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionText}>Report Barrier</Text>
              <Text style={styles.actionSubtext}>Say "report" to report issues</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleVoiceCommand('navigate')}
            accessible={true}
            accessibilityLabel="Start navigation"
            accessibilityHint="Double tap to start voice navigation"
          >
            <View style={styles.actionIcon}>
              <Ionicons name="navigate" size={32} color="#4CAF50" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionText}>Navigate</Text>
              <Text style={styles.actionSubtext}>Say "navigate" to start</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleVoiceCommand('profile')}
            accessible={true}
            accessibilityLabel="Open profile"
            accessibilityHint="Double tap to open your profile settings"
          >
            <View style={styles.actionIcon}>
              <Ionicons name="person" size={32} color="#9C27B0" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionText}>Profile</Text>
              <Text style={styles.actionSubtext}>Say "profile" to open</Text>
            </View>
          </TouchableOpacity>
        </View>

        {nearbyBarriers.length > 0 && (
          <View style={styles.alertsContainer}>
            <Text style={styles.sectionTitle}>⚠️ Nearby Alerts</Text>
            {nearbyBarriers.slice(0, 3).map((barrier: any) => (
              <View key={barrier.id} style={styles.alert}>
                <Ionicons name="warning" size={24} color="#FF9800" />
                <View style={styles.alertContent}>
                  <Text style={styles.alertText}>
                    {barrier.barrier_type.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.alertSeverity}>
                    {barrier.severity.toUpperCase()} severity
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 32,
  },
  headerIcon: {
    position: 'relative',
    marginBottom: 16,
  },
  iconPulse: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    backgroundColor: '#2196F3',
    opacity: 0.3,
    borderRadius: 36,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#2196F3',
    marginBottom: 4,
    fontWeight: '600',
  },
  statusIndicator: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  micContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  listeningRing: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: 50,
    opacity: 0.6,
  },
  statusText: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  statusSubtext: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  voiceButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
  voiceButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
  },
  alertsContainer: {
    marginTop: 16,
  },
  alert: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  alertContent: {
    flex: 1,
    marginLeft: 16,
  },
  alertText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  alertSeverity: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
});