import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AccessibilityGuideProps {
  mode: 'blind' | 'deaf' | 'wheelchair';
  visible: boolean;
  onClose: () => void;
}

export default function AccessibilityGuide({ mode, visible, onClose }: AccessibilityGuideProps) {
  const getModeGuide = () => {
    switch (mode) {
      case 'blind':
        return {
          title: 'Blind Mode Guide',
          icon: 'volume-high',
          color: '#2196F3',
          features: [
            {
              icon: 'mic',
              title: 'Voice Commands',
              description: 'Say "search", "report", "navigate", or "profile" to activate features',
            },
            {
              icon: 'volume-high',
              title: 'Audio Navigation',
              description: 'Continuous voice guidance and proximity alerts for nearby barriers',
            },
            {
              icon: 'warning',
              title: 'Hazard Alerts',
              description: 'Automatic audio warnings for obstacles within 50 meters',
            },
            {
              icon: 'search',
              title: 'Voice Search',
              description: 'Natural language search for accessible locations',
            },
          ],
        };
      case 'deaf':
        return {
          title: 'Deaf Mode Guide',
          icon: 'eye',
          color: '#FF9800',
          features: [
            {
              icon: 'eye',
              title: 'Visual Interface',
              description: 'High-contrast, large text interface optimized for visual navigation',
            },
            {
              icon: 'phone-portrait',
              title: 'Haptic Feedback',
              description: 'Vibration patterns for notifications and alerts',
            },
            {
              icon: 'warning',
              title: 'Visual Alerts',
              description: 'Large, bold text banners for important information',
            },
            {
              icon: 'map',
              title: 'Visual Maps',
              description: 'Color-coded accessibility scores and clear visual indicators',
            },
          ],
        };
      case 'wheelchair':
        return {
          title: 'Wheelchair Mode Guide',
          icon: 'accessibility',
          color: '#4CAF50',
          features: [
            {
              icon: 'map',
              title: 'Accessibility Scores',
              description: '1-10 scale rating for wheelchair accessibility of locations',
            },
            {
              icon: 'trending-up',
              title: 'Route Planning',
              description: 'Automatic routing avoiding stairs, curbs, and rough terrain',
            },
            {
              icon: 'checkmark-circle',
              title: 'Feature Detection',
              description: 'Identifies ramps, elevators, and smooth surfaces',
            },
            {
              icon: 'analytics',
              title: 'Heat Maps',
              description: 'Visual overlay showing accessibility scores across areas',
            },
          ],
        };
    }
  };

  const guide = getModeGuide();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: guide.color }]}>
              <Ionicons name={guide.icon as any} size={32} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>{guide.title}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.description}>
            Learn how to use Sanchara's {mode} mode features for the best navigation experience.
          </Text>

          {guide.features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: guide.color }]}>
                <Ionicons name={feature.icon as any} size={24} color="#fff" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}

          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
            <View style={styles.tip}>
              <Text style={styles.tipText}>
                • Use voice commands frequently in Blind Mode for hands-free navigation
              </Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipText}>
                • Enable haptic feedback in settings for better Deaf Mode experience
              </Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipText}>
                • Report barriers to help improve accessibility data for everyone
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.gotItButton, { backgroundColor: guide.color }]} onPress={onClose}>
            <Text style={styles.gotItButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tipsSection: {
    marginTop: 24,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 12,
  },
  tip: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  gotItButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  gotItButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
