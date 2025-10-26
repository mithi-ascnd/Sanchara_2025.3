import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import SancharaScore from '../../components/SancharaScore';
import CurrentLocationScore from '../../components/CurrentLocationScore';
import EnhancedHeader from '../../components/EnhancedHeader';
import EnhancedFloatingButton from '../../components/EnhancedFloatingButton';
import EnhancedLocationCard from '../../components/EnhancedLocationCard';
import VoiceAgent from '../../components/VoiceAgent';
import { LinearGradient } from 'expo-linear-gradient';

// Conditional import for maps (only on native)
let MapView: any;
let Marker: any;
let PROVIDER_DEFAULT: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_DEFAULT = Maps.PROVIDER_DEFAULT;
}

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function WheelchairNavigation() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [currentLocationScore, setCurrentLocationScore] = useState<number | null>(null);
  const [voiceAgentEnabled, setVoiceAgentEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      // On web, skip location and just show the interface
      if (Platform.OS === 'web') {
        setLocation({
          latitude: 40.758896,
          longitude: -73.985130,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLoading(false);
        fetchNearbyLocations(40.758896, -73.985130);
        fetchHeatmapData(40.758896, -73.985130);
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
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

      // Fetch nearby locations
      fetchNearbyLocations(currentLocation.coords.latitude, currentLocation.coords.longitude);
      fetchHeatmapData(currentLocation.coords.latitude, currentLocation.coords.longitude);
    })();
  }, []);

  const fetchNearbyLocations = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `${API_URL}/api/locations?latitude=${lat}&longitude=${lng}&radius=5000`
      );
      const data = await response.json();
      setNearbyLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchHeatmapData = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `${API_URL}/api/locations/heatmap?latitude=${lat}&longitude=${lng}`
      );
      const data = await response.json();
      setHeatmapData(data.heatmap || []);
    } catch (error) {
      console.error('Error fetching heatmap:', error);
    }
  };

  const handleVoiceInput = (text: string) => {
    // Handle voice commands for navigation
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('search') || lowerText.includes('find')) {
      router.push('/search');
    } else if (lowerText.includes('report') || lowerText.includes('barrier')) {
      router.push('/report');
    } else if (lowerText.includes('profile') || lowerText.includes('settings')) {
      router.push('/profile');
    } else if (lowerText.includes('menu')) {
      setShowMenu(!showMenu);
    }
  };

  const toggleVoiceAgent = () => {
    setVoiceAgentEnabled(!voiceAgentEnabled);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.gradient}
      >
        {Platform.OS === 'web' ? (
          <View style={styles.webFallback}>
            <Text style={styles.webText}>Map View (Mobile Only)</Text>
            <Text style={styles.webSubtext}>This feature is best experienced on a mobile device</Text>
          </View>
        ) : (
          MapView && (
            <MapView
              provider={PROVIDER_DEFAULT}
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
                  description={`Sanchara Score: ${loc.sanchara_score}/10`}
                  pinColor={loc.sanchara_score >= 8 ? '#00D4AA' : loc.sanchara_score >= 6 ? '#4ECDC4' : loc.sanchara_score >= 4 ? '#FFE66D' : '#FF6B6B'}
                />
              ))}

              {heatmapData.map((point: any, index: number) => (
                <Marker
                  key={`heatmap-${index}`}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                  opacity={point.intensity}
                />
              ))}
            </MapView>
          )
        )}

      <EnhancedHeader
        title="Wheelchair Mode"
        subtitle="Accessible Routes"
        icon="accessibility"
        iconColor="#00D4AA"
        onMenuPress={() => setShowMenu(!showMenu)}
        onVoiceToggle={toggleVoiceAgent}
        voiceEnabled={voiceAgentEnabled}
        showVoiceToggle={true}
      />

      {showMenu && (
        <View style={styles.menu}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              router.push('/search');
            }}
          >
            <Ionicons name="search" size={24} color="#fff" />
            <Text style={styles.menuText}>AI Search</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              router.push('/report');
            }}
          >
            <Ionicons name="warning" size={24} color="#fff" />
            <Text style={styles.menuText}>Report Barrier</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              router.push('/profile');
            }}
          >
            <Ionicons name="person" size={24} color="#fff" />
            <Text style={styles.menuText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              handleLogout();
            }}
          >
            <Ionicons name="log-out" size={24} color="#fff" />
            <Text style={styles.menuText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Current Location Score */}
      <View style={styles.currentLocationContainer}>
        <CurrentLocationScore 
          onScoreUpdate={setCurrentLocationScore}
          style={styles.currentLocationScore}
        />
      </View>

      <View style={styles.bottomPanel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Nearby Places</Text>
          <Text style={styles.panelSubtitle}>Accessibility scores for current location</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationsScroll}>
          {nearbyLocations.slice(0, 5).map((loc: any) => {
            const features = [];
            if (loc.has_ramp) features.push('Ramp Access');
            if (loc.has_elevator) features.push('Elevator');
            if (loc.surface_type === 'smooth') features.push('Smooth Surface');
            if (loc.has_accessible_parking) features.push('Accessible Parking');
            
            return (
              <EnhancedLocationCard
                key={loc.id}
                name={loc.name}
                address={loc.address}
                distance={loc.distance}
                sancharaScore={loc.sanchara_score}
                features={features}
                onPress={() => {
                  // Handle card press - could navigate to details
                  console.log('Navigate to location details:', loc.name);
                }}
                accessibilityLabel={`${loc.name}, accessibility score ${loc.sanchara_score}`}
              />
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.floatingButtons}>
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

        <EnhancedFloatingButton
          icon="search"
          label="Search"
          onPress={() => router.push('/search')}
          color="#00D4AA"
          size="medium"
          accessibilityLabel="Search for accessible locations"
          accessibilityHint="Double tap to search for wheelchair-accessible places"
        />

        <EnhancedFloatingButton
          icon="warning"
          label="Report"
          onPress={() => router.push('/report')}
          color="#FF6B6B"
          size="medium"
          accessibilityLabel="Report accessibility barrier"
          accessibilityHint="Double tap to report barriers or obstacles"
        />
      </View>
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
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    backgroundColor: '#4CAF50',
    opacity: 0.3,
    borderRadius: 18,
  },
  headerText: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceToggleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  menu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 212, 170, 0.3)',
  },
  panelHeader: {
    marginBottom: 16,
  },
  panelTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  panelSubtitle: {
    color: '#ccc',
    fontSize: 14,
  },
  locationsScroll: {
    paddingBottom: 8,
  },
  locationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 280,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  locationDetails: {
    marginBottom: 12,
  },
  locationAddress: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  locationDistance: {
    color: '#00D4AA',
    fontSize: 12,
    fontWeight: '500',
  },
  features: {
    gap: 6,
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '500',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 212, 170, 0.2)',
  },
  viewDetailsText: {
    color: '#00D4AA',
    fontSize: 14,
    fontWeight: '600',
  },
  floatingButtons: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    gap: 16,
  },
  floatingButton: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reportButton: {
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webFallback: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  webText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  webSubtext: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  currentLocationContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 120,
    left: 16,
    right: 16,
  },
  currentLocationScore: {
    marginBottom: 16,
  },
  voiceAgentContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
});