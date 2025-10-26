import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import SancharaScore from './SancharaScore';
import { LinearGradient } from 'expo-linear-gradient';

interface CompactLocationScoreProps {
  onScoreUpdate?: (score: number) => void;
  style?: any;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  sancharaScore: number;
}

export default function CompactLocationScore({ onScoreUpdate, style }: CompactLocationScoreProps) {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentLocationScore();
  }, []);

  const fetchCurrentLocationScore = async () => {
    try {
      setLoading(true);
      setError(null);

      // On web, use mock data
      if (Platform.OS === 'web') {
        const mockData: LocationData = {
          latitude: 40.758896,
          longitude: -73.985130,
          address: 'Times Square, NY',
          sancharaScore: 7.8,
        };
        setLocationData(mockData);
        onScoreUpdate?.(mockData.sancharaScore);
        setLoading(false);
        return;
      }

      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location denied');
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocoding to get address
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const address = addressResponse[0] 
        ? `${addressResponse[0].street || ''} ${addressResponse[0].city || ''}`.trim()
        : 'Current Location';

      // Calculate Sanchara score
      const sancharaScore = await calculateLocationScore(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );

      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address,
        sancharaScore,
      };

      setLocationData(locationData);
      onScoreUpdate?.(sancharaScore);
    } catch (error) {
      console.error('Error fetching location score:', error);
      setError('Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const calculateLocationScore = async (latitude: number, longitude: number): Promise<number> => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(
        `${API_URL}/api/locations/score?latitude=${latitude}&longitude=${longitude}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.score || 7.5;
      }
    } catch (error) {
      console.error('Error calculating score:', error);
    }

    // Fallback calculation
    const baseScore = 6.0;
    const randomFactor = Math.random() * 3;
    const finalScore = Math.min(10, baseScore + randomFactor);
    return Math.round(finalScore * 10) / 10;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#00D4AA';
    if (score >= 6) return '#4ECDC4';
    if (score >= 4) return '#FFE66D';
    if (score >= 2) return '#FF6B6B';
    return '#FF4757';
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.9)']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <Ionicons name="location" size={16} color="#00D4AA" />
            <Text style={styles.loadingText}>Calculating...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (error || !locationData) {
    return (
      <View style={[styles.container, style]}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.9)']}
          style={styles.gradient}
        >
          <TouchableOpacity 
            style={styles.errorContainer}
            onPress={fetchCurrentLocationScore}
            accessible={true}
            accessibilityLabel="Retry location score"
          >
            <Ionicons name="refresh" size={16} color="#FF6B6B" />
            <Text style={styles.errorText}>Retry</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  const scoreColor = getScoreColor(locationData.sancharaScore);

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.9)']}
        style={styles.gradient}
      >
        <TouchableOpacity 
          style={styles.content}
          onPress={fetchCurrentLocationScore}
          accessible={true}
          accessibilityLabel={`Current location accessibility score: ${locationData.sancharaScore} out of 10`}
          accessibilityHint="Double tap to refresh location score"
        >
          <View style={styles.leftSection}>
            <Ionicons name="location" size={14} color={scoreColor} />
            <Text style={styles.address} numberOfLines={1}>
              {locationData.address}
            </Text>
          </View>
          
          <View style={styles.scoreSection}>
            <SancharaScore 
              score={locationData.sancharaScore} 
              size="small"
              showLabel={false}
              accessibilityLabel={`Accessibility score: ${locationData.sancharaScore}`}
            />
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  gradient: {
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  address: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  scoreSection: {
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '500',
  },
});
