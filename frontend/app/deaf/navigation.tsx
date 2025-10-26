import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, Vibration } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

// Conditional import for maps (only on native)
let MapView: any;
let Marker: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function DeafNavigation() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    initializeDeafMode();
  }, []);

  const initializeDeafMode = async () => {
    // Haptic feedback for app start (skip on web)
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // On web, skip location and use default
    if (Platform.OS === 'web') {
      setLocation({
        latitude: 40.758896,
        longitude: -73.985130,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setLoading(false);
      fetchNearbyLocations(40.758896, -73.985130);
      fetchAlerts(40.758896, -73.985130);
      return;
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('⚠️ Permission Required', 'Location permission is needed for navigation');
      setLoading(false);
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setLoading(false);

    fetchNearbyLocations(currentLocation.coords.latitude, currentLocation.coords.longitude);
    fetchAlerts(currentLocation.coords.latitude, currentLocation.coords.longitude);
  };

  const fetchNearbyLocations = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `${API_URL}/api/locations?latitude=${lat}&longitude=${lng}&radius=5000`
      );
      const data = await response.json();
      setNearbyLocations(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAlerts = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `${API_URL}/api/alerts?latitude=${lat}&longitude=${lng}`
      );
      const data = await response.json();
      setAlerts(data);
      
      // Haptic feedback for alerts
      if (data.length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Vibration.vibrate([0, 200, 100, 200]); // Pattern vibration
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleButtonPress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action();
  };

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await logout();
    router.replace('/');
  };

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>⏳ LOADING MAP...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <View style={styles.webFallback}>
          <Text style={styles.webText}>🗺️ MAP VIEW (MOBILE ONLY)</Text>
          <Text style={styles.webSubtext}>This app is designed for mobile devices. Please use Expo Go on your phone!</Text>
        </View>
      ) : (
        MapView && (
          <MapView
            style={styles.map}
            initialRegion={location}
            showsUserLocation
            showsMyLocationButton
          >
            {nearbyLocations.map((loc: any) => (
              <Marker
                key={loc.id}
                coordinate={{
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }}
                title={loc.name}
                description={`⭐ ${loc.sanchara_score}/10`}
                pinColor={loc.sanchara_score >= 7 ? '#4CAF50' : loc.sanchara_score >= 4 ? '#FF9800' : '#F44336'}
              />
            ))}
          </MapView>
        )
      )}

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="eye" size={32} color="#000" />
            <View style={styles.iconGlow} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>DEAF MODE</Text>
            <Text style={styles.headerSubtitle}>VISUAL NAVIGATION</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => handleButtonPress(() => setShowMenu(!showMenu))}
          style={styles.menuButton}
          accessible={true}
          accessibilityLabel="Open menu"
          accessibilityHint="Double tap to open navigation menu"
        >
          <Ionicons name="menu" size={36} color="#000" />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={styles.menu}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleButtonPress(() => {
              setShowMenu(false);
              router.push('/search');
            })}
          >
            <Ionicons name="search" size={28} color="#000" />
            <Text style={styles.menuText}>🔍 SEARCH</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleButtonPress(() => {
              setShowMenu(false);
              router.push('/report');
            })}
          >
            <Ionicons name="warning" size={28} color="#000" />
            <Text style={styles.menuText}>⚠️ REPORT</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleButtonPress(() => {
              setShowMenu(false);
              router.push('/profile');
            })}
          >
            <Ionicons name="person" size={28} color="#000" />
            <Text style={styles.menuText}>👤 PROFILE</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleButtonPress(handleLogout)}
          >
            <Ionicons name="log-out" size={28} color="#000" />
            <Text style={styles.menuText}>🚪 LOGOUT</Text>
          </TouchableOpacity>
        </View>
      )}

      {alerts.length > 0 && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning" size={32} color="#000" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>⚠️ {alerts.length} ACTIVE ALERTS</Text>
            <Text style={styles.alertText}>{alerts[0].message}</Text>
          </View>
        </View>
      )}

      <View style={styles.bottomPanel}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {nearbyLocations.slice(0, 5).map((loc: any) => (
            <View key={loc.id} style={styles.locationCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.locationName}>{loc.name}</Text>
                <View style={[
                  styles.scoreBadge,
                  { backgroundColor: loc.sanchara_score >= 7 ? '#4CAF50' : loc.sanchara_score >= 4 ? '#FF9800' : '#F44336' }
                ]}>
                  <Text style={styles.scoreText}>{loc.sanchara_score.toFixed(1)}</Text>
                </View>
              </View>
              
              <View style={styles.features}>
                {loc.has_ramp && (
                  <View style={styles.featureBadge}>
                    <Text style={styles.featureBadgeText}>✓ RAMP</Text>
                  </View>
                )}
                {loc.has_elevator && (
                  <View style={styles.featureBadge}>
                    <Text style={styles.featureBadgeText}>✓ ELEVATOR</Text>
                  </View>
                )}
                {loc.surface_type === 'smooth' && (
                  <View style={styles.featureBadge}>
                    <Text style={styles.featureBadgeText}>✓ SMOOTH</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.floatingButtons}>
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => handleButtonPress(() => router.push('/search'))}
          accessible={true}
          accessibilityLabel="Search for accessible locations"
          accessibilityHint="Double tap to search for nearby accessible places"
        >
          <View style={styles.floatingButtonIcon}>
            <Ionicons name="search" size={36} color="#000" />
          </View>
          <Text style={styles.floatingButtonText}>SEARCH</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.floatingButton, styles.reportButton]}
          onPress={() => handleButtonPress(() => router.push('/report'))}
          accessible={true}
          accessibilityLabel="Report accessibility barrier"
          accessibilityHint="Double tap to report barriers or obstacles"
        >
          <View style={styles.floatingButtonIcon}>
            <Ionicons name="warning" size={36} color="#000" />
          </View>
          <Text style={styles.floatingButtonText}>REPORT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#000',
    fontSize: 28,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    padding: 24,
    borderRadius: 20,
    borderWidth: 5,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: '#000',
    opacity: 0.2,
    borderRadius: 20,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: '#000',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  menuButton: {
    padding: 8,
  },
  menu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 120,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    minWidth: 240,
    borderWidth: 4,
    borderColor: '#000',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#e0e0e0',
  },
  menuText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  alertBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 160 : 140,
    left: 16,
    right: 16,
    backgroundColor: '#FF9800',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 4,
    borderColor: '#000',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'black',
    color: '#000',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderTopWidth: 4,
    borderTopColor: '#000',
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  locationCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 8,
    width: 240,
    borderWidth: 3,
    borderColor: '#000',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationName: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'black',
    flex: 1,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
  },
  scoreText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'black',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000',
  },
  featureBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'black',
  },
  floatingButtons: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    gap: 20,
  },
  floatingButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#000',
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reportButton: {
    backgroundColor: '#FF9800',
  },
  floatingButtonIcon: {
    marginBottom: 8,
  },
  floatingButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  webFallback: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    borderWidth: 4,
    borderColor: '#000',
    margin: 16,
    borderRadius: 16,
  },
  webText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  webSubtext: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
});