import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SancharaScoreProps {
  score: number;
  maxScore?: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  accessibilityLabel?: string;
}

export default function SancharaScore({ 
  score, 
  maxScore = 10, 
  size = 'medium',
  showLabel = true,
  accessibilityLabel 
}: SancharaScoreProps) {
  const percentage = (score / maxScore) * 100;
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#00D4AA'; // Excellent - Teal
    if (score >= 6) return '#4ECDC4'; // Good - Light Teal
    if (score >= 4) return '#FFE66D'; // Fair - Yellow
    if (score >= 2) return '#FF6B6B'; // Poor - Red
    return '#FF4757'; // Very Poor - Dark Red
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return 'star';
    if (score >= 6) return 'thumbs-up';
    if (score >= 4) return 'checkmark-circle';
    if (score >= 2) return 'warning';
    return 'close-circle';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    if (score >= 2) return 'Poor';
    return 'Very Poor';
  };

  const sizeStyles = {
    small: {
      container: styles.smallContainer,
      score: styles.smallScore,
      label: styles.smallLabel,
      icon: 16,
    },
    medium: {
      container: styles.mediumContainer,
      score: styles.mediumScore,
      label: styles.mediumLabel,
      icon: 20,
    },
    large: {
      container: styles.largeContainer,
      score: styles.largeScore,
      label: styles.largeLabel,
      icon: 24,
    },
  };

  const currentSize = sizeStyles[size];
  const scoreColor = getScoreColor(score);
  const scoreIcon = getScoreIcon(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <View 
      style={[currentSize.container, { borderColor: scoreColor }]}
      accessible={true}
      accessibilityLabel={accessibilityLabel || `Sanchara Score: ${score} out of ${maxScore}, ${scoreLabel} accessibility`}
      accessibilityHint="Accessibility rating for this location"
    >
      <View style={styles.scoreHeader}>
        <Ionicons 
          name={scoreIcon as any} 
          size={currentSize.icon} 
          color={scoreColor} 
        />
        <Text style={[currentSize.score, { color: scoreColor }]}>
          {score.toFixed(1)}
        </Text>
      </View>
      
      {showLabel && (
        <Text style={[currentSize.label, { color: scoreColor }]}>
          {scoreLabel}
        </Text>
      )}
      
      <View style={styles.scoreBar}>
        <View 
          style={[
            styles.scoreFill, 
            { 
              width: `${percentage}%`,
              backgroundColor: scoreColor 
            }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  smallContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    minWidth: 60,
  },
  mediumContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    minWidth: 80,
  },
  largeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    minWidth: 100,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 4,
  },
  smallScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  mediumScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  largeScore: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  smallLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  mediumLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 6,
  },
  largeLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 2,
  },
});
