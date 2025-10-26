import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface EnhancedFloatingButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function EnhancedFloatingButton({
  icon,
  label,
  onPress,
  color = '#00D4AA',
  size = 'medium',
  disabled = false,
  accessibilityLabel,
  accessibilityHint
}: EnhancedFloatingButtonProps) {
  const sizeStyles = {
    small: {
      container: styles.smallContainer,
      icon: 20,
      text: styles.smallText,
      padding: { paddingHorizontal: 12, paddingVertical: 8 },
    },
    medium: {
      container: styles.mediumContainer,
      icon: 24,
      text: styles.mediumText,
      padding: { paddingHorizontal: 16, paddingVertical: 12 },
    },
    large: {
      container: styles.largeContainer,
      icon: 28,
      text: styles.largeText,
      padding: { paddingHorizontal: 20, paddingVertical: 16 },
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        currentSize.container,
        currentSize.padding,
        { opacity: disabled ? 0.6 : 1 }
      ]}
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
    >
      <LinearGradient
        colors={[color, `${color}CC`]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Ionicons 
            name={icon as any} 
            size={currentSize.icon} 
            color="#fff" 
          />
          <Text style={[currentSize.text, styles.label]}>
            {label}
          </Text>
        </View>
        
        {/* Glow effect */}
        <View style={[styles.glow, { backgroundColor: color }]} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  gradient: {
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 2,
  },
  glow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 18,
    opacity: 0.3,
    zIndex: 1,
  },
  smallContainer: {
    minWidth: 80,
  },
  mediumContainer: {
    minWidth: 100,
  },
  largeContainer: {
    minWidth: 120,
  },
  smallText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mediumText: {
    fontSize: 14,
    fontWeight: '600',
  },
  largeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    color: '#fff',
    textAlign: 'center',
  },
});
