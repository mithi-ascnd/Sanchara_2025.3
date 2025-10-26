import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface EnhancedHeaderProps {
  title: string;
  subtitle: string;
  icon: string;
  iconColor?: string;
  onMenuPress?: () => void;
  onVoiceToggle?: () => void;
  voiceEnabled?: boolean;
  showVoiceToggle?: boolean;
}

export default function EnhancedHeader({
  title,
  subtitle,
  icon,
  iconColor = '#00D4AA',
  onMenuPress,
  onVoiceToggle,
  voiceEnabled = true,
  showVoiceToggle = true
}: EnhancedHeaderProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.7)']}
        style={styles.gradient}
      >
        <BlurView intensity={20} style={styles.blurContainer}>
          <View style={styles.content}>
            <View style={styles.leftSection}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconBackground, { backgroundColor: iconColor }]}>
                  <Ionicons name={icon as any} size={24} color="#fff" />
                </View>
                <View style={[styles.iconGlow, { backgroundColor: iconColor }]} />
              </View>
              
              <View style={styles.textSection}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
            </View>

            <View style={styles.rightSection}>
              {showVoiceToggle && (
                <TouchableOpacity 
                  style={styles.voiceToggle}
                  onPress={onVoiceToggle}
                  accessible={true}
                  accessibilityLabel={voiceEnabled ? 'Disable voice agent' : 'Enable voice agent'}
                >
                  <Ionicons 
                    name={voiceEnabled ? 'volume-high' : 'volume-mute'} 
                    size={20} 
                    color={voiceEnabled ? '#00D4AA' : '#666'} 
                  />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={onMenuPress}
                accessible={true}
                accessibilityLabel="Open menu"
                accessibilityHint="Double tap to open navigation menu"
              >
                <Ionicons name="menu" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    borderRadius: 20,
  },
  blurContainer: {
    borderRadius: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingVertical: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  iconGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 28,
    opacity: 0.2,
  },
  textSection: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    color: '#00D4AA',
    fontSize: 14,
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceToggle: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
