import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SancharaScore from './SancharaScore';

interface EnhancedLocationCardProps {
  name: string;
  address: string;
  distance?: number;
  sancharaScore: number;
  features: string[];
  onPress?: () => void;
  accessibilityLabel?: string;
}

export default function EnhancedLocationCard({
  name,
  address,
  distance,
  sancharaScore,
  features,
  onPress,
  accessibilityLabel
}: EnhancedLocationCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#00D4AA';
    if (score >= 6) return '#4ECDC4';
    if (score >= 4) return '#FFE66D';
    if (score >= 2) return '#FF6B6B';
    return '#FF4757';
  };

  const scoreColor = getScoreColor(sancharaScore);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={accessibilityLabel || `${name}, accessibility score ${sancharaScore}`}
      accessibilityHint="Double tap to view details"
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.address} numberOfLines={2}>
                {address}
              </Text>
            </View>
            
            <View style={styles.scoreSection}>
              <SancharaScore 
                score={sancharaScore} 
                size="medium"
                accessibilityLabel={`${name} accessibility score: ${sancharaScore} out of 10`}
              />
            </View>
          </View>

          {/* Distance */}
          {distance && (
            <View style={styles.distanceContainer}>
              <Ionicons name="location" size={14} color="#00D4AA" />
              <Text style={styles.distance}>
                {distance.toFixed(1)} km away
              </Text>
            </View>
          )}

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.slice(0, 3).map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={14} 
                  color={scoreColor} 
                />
                <Text style={styles.featureText}>
                  {feature}
                </Text>
              </View>
            ))}
            {features.length > 3 && (
              <Text style={styles.moreFeatures}>
                +{features.length - 3} more
              </Text>
            )}
          </View>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <View style={[styles.actionButton, { borderColor: scoreColor }]}>
              <Text style={[styles.actionText, { color: scoreColor }]}>
                View Details
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={14} 
                color={scoreColor} 
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginRight: 16,
    width: 300,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    borderRadius: 20,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  scoreSection: {
    alignItems: 'flex-end',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  distance: {
    color: '#00D4AA',
    fontSize: 12,
    fontWeight: '500',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  featureText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '500',
  },
  moreFeatures: {
    color: '#888',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
