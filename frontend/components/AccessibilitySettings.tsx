import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AccessibilitySettingsProps {
  mode: 'blind' | 'deaf' | 'wheelchair';
  onModeChange?: (mode: 'blind' | 'deaf' | 'wheelchair') => void;
  onSettingsChange?: (settings: any) => void;
}

export default function AccessibilitySettings({ 
  mode, 
  onModeChange, 
  onSettingsChange 
}: AccessibilitySettingsProps) {
  const [settings, setSettings] = useState({
    voiceGuidance: mode === 'blind',
    hapticFeedback: mode === 'deaf',
    highContrast: mode === 'deaf',
    largeText: mode === 'deaf',
    voiceCommands: mode === 'blind',
    audioAlerts: mode === 'blind',
    visualAlerts: mode === 'deaf',
    accessibilityScores: mode === 'wheelchair',
  });

  const updateSetting = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const getModeSpecificSettings = () => {
    switch (mode) {
      case 'blind':
        return [
          { key: 'voiceGuidance', title: 'Voice Guidance', description: 'Continuous audio navigation' },
          { key: 'voiceCommands', title: 'Voice Commands', description: 'Activate features with voice' },
          { key: 'audioAlerts', title: 'Audio Alerts', description: 'Sound notifications for hazards' },
        ];
      case 'deaf':
        return [
          { key: 'hapticFeedback', title: 'Haptic Feedback', description: 'Vibration for notifications' },
          { key: 'highContrast', title: 'High Contrast', description: 'Enhanced visual contrast' },
          { key: 'largeText', title: 'Large Text', description: 'Bigger fonts for readability' },
          { key: 'visualAlerts', title: 'Visual Alerts', description: 'Banner notifications' },
        ];
      case 'wheelchair':
        return [
          { key: 'accessibilityScores', title: 'Accessibility Scores', description: 'Show 1-10 accessibility ratings' },
          { key: 'hapticFeedback', title: 'Haptic Feedback', description: 'Vibration for route updates' },
        ];
    }
  };

  const modeSettings = getModeSpecificSettings();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="settings" size={24} color="#4CAF50" />
        <Text style={styles.headerTitle}>Accessibility Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Mode: {mode.toUpperCase()}</Text>
        <Text style={styles.sectionDescription}>
          Settings optimized for {mode} users
        </Text>
      </View>

      <View style={styles.settingsList}>
        {modeSettings.map((setting) => (
          <View key={setting.key} style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
            <Switch
              value={settings[setting.key as keyof typeof settings]}
              onValueChange={(value) => updateSetting(setting.key, value)}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={settings[setting.key as keyof typeof settings] ? '#fff' : '#f4f3f4'}
              accessible={true}
              accessibilityLabel={`${setting.title} toggle`}
              accessibilityHint={`Double tap to ${settings[setting.key as keyof typeof settings] ? 'disable' : 'enable'} ${setting.title}`}
            />
          </View>
        ))}
      </View>

      <View style={styles.modeSection}>
        <Text style={styles.sectionTitle}>Switch Mode</Text>
        <View style={styles.modeButtons}>
          {(['blind', 'deaf', 'wheelchair'] as const).map((modeOption) => (
            <TouchableOpacity
              key={modeOption}
              style={[
                styles.modeButton,
                mode === modeOption && styles.modeButtonActive,
              ]}
              onPress={() => {
                Alert.alert(
                  'Switch Mode',
                  `Switch to ${modeOption} mode? This will change the interface and available features.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Switch',
                      onPress: () => onModeChange?.(modeOption),
                    },
                  ]
                );
              }}
              accessible={true}
              accessibilityLabel={`Switch to ${modeOption} mode`}
              accessibilityHint={`Double tap to switch to ${modeOption} mode`}
            >
              <Ionicons
                name={
                  modeOption === 'blind' ? 'volume-high' :
                  modeOption === 'deaf' ? 'eye' : 'accessibility'
                }
                size={24}
                color={mode === modeOption ? '#fff' : '#4CAF50'}
              />
              <Text style={[
                styles.modeButtonText,
                mode === modeOption && styles.modeButtonTextActive,
              ]}>
                {modeOption.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Settings are automatically saved and applied immediately
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  settingsList: {
    marginBottom: 32,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  modeSection: {
    marginBottom: 24,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
