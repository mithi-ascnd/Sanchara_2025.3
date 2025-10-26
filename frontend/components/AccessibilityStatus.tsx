import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AccessibilityStatusProps {
  mode: 'blind' | 'deaf' | 'wheelchair';
  isActive?: boolean;
  status?: string;
  subtitle?: string;
  showIcon?: boolean;
  style?: any;
}

export default function AccessibilityStatus({
  mode,
  isActive = true,
  status,
  subtitle,
  showIcon = true,
  style,
}: AccessibilityStatusProps) {
  const getModeConfig = () => {
    switch (mode) {
      case 'blind':
        return {
          icon: 'volume-high',
          color: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          title: 'Blind Mode',
          defaultStatus: 'Voice Navigation Active',
        };
      case 'deaf':
        return {
          icon: 'eye',
          color: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          title: 'Deaf Mode',
          defaultStatus: 'Visual Navigation Active',
        };
      case 'wheelchair':
        return {
          icon: 'accessibility',
          color: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          title: 'Wheelchair Mode',
          defaultStatus: 'Accessible Routes Active',
        };
    }
  };

  const config = getModeConfig();
  const displayStatus = status || config.defaultStatus;

  return (
    <View style={[
      styles.container,
      { backgroundColor: config.backgroundColor },
      style,
    ]}>
      {showIcon && (
        <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon as any} size={24} color="#fff" />
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: config.color }]}>
          {config.title}
        </Text>
        <Text style={styles.status}>
          {displayStatus}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
        {!isActive && (
          <View style={styles.inactiveIndicator}>
            <Ionicons name="pause" size={16} color="#666" />
            <Text style={styles.inactiveText}>Inactive</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#aaa',
    fontStyle: 'italic',
  },
  inactiveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  inactiveText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
