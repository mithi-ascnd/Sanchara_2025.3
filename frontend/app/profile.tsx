import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const router = useRouter();
  const { user, logout, updateMode, upgradeToPremium } = useAuthStore();

  const handleModeChange = async (mode: string) => {
    Alert.alert(
      'Change Mode',
      `Switch to ${mode} mode?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: async () => {
            await updateMode(mode);
            Alert.alert('Success', 'Mode changed successfully!', [
              { text: 'OK', onPress: () => router.replace('/') }
            ]);
          }
        }
      ]
    );
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Premium features include:\n• Real-time smart alerts\n• Offline maps\n• Priority support',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            await upgradeToPremium();
            Alert.alert('Success', 'Welcome to Sanchara Premium!');
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  const isDeafMode = user?.mode === 'deaf';

  return (
    <ScrollView style={[styles.container, isDeafMode && styles.containerDeaf]}>
      <View style={styles.content}>
        <TouchableOpacity 
          style={[styles.backButton, isDeafMode && styles.backButtonDeaf]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={isDeafMode ? "#000" : "#fff"} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Ionicons name="person-circle" size={80} color={isDeafMode ? "#000" : "#4CAF50"} />
          <Text style={[styles.title, isDeafMode && styles.titleDeaf]}>
            {isDeafMode ? '👤 PROFILE' : 'Profile'}
          </Text>
          <Text style={[styles.username, isDeafMode && styles.usernameDeaf]}>
            {user?.username}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDeafMode && styles.sectionTitleDeaf]}>
            {isDeafMode ? '🏆 ACCOUNT' : 'Account'}
          </Text>
          
          <View style={[styles.card, isDeafMode && styles.cardDeaf]}>
            <View style={styles.row}>
              <Text style={[styles.label, isDeafMode && styles.labelDeaf]}>
                {isDeafMode ? '👤 USERNAME:' : 'Username:'}
              </Text>
              <Text style={[styles.value, isDeafMode && styles.valueDeaf]}>
                {user?.username}
              </Text>
            </View>
            
            <View style={styles.row}>
              <Text style={[styles.label, isDeafMode && styles.labelDeaf]}>
                {isDeafMode ? '🦸 MODE:' : 'Current Mode:'}
              </Text>
              <Text style={[styles.value, styles.modeValue, isDeafMode && styles.valueDeaf]}>
                {user?.mode?.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.row}>
              <Text style={[styles.label, isDeafMode && styles.labelDeaf]}>
                {isDeafMode ? '⭐ STATUS:' : 'Status:'}
              </Text>
              <View style={[
                styles.premiumBadge,
                user?.is_premium && styles.premiumBadgeActive,
                isDeafMode && styles.premiumBadgeDeaf,
              ]}>
                <Text style={[
                  styles.premiumText,
                  user?.is_premium && styles.premiumTextActive,
                  isDeafMode && styles.premiumTextDeaf,
                ]}>
                  {user?.is_premium ? (isDeafMode ? '⭐ PREMIUM' : 'PREMIUM') : (isDeafMode ? '🆓 FREE' : 'FREE')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDeafMode && styles.sectionTitleDeaf]}>
            {isDeafMode ? '🔄 CHANGE MODE' : 'Switch Accessibility Mode'}
          </Text>
          
          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                isDeafMode && styles.modeButtonDeaf,
                user?.mode === 'blind' && styles.modeButtonActive,
                isDeafMode && user?.mode === 'blind' && styles.modeButtonActiveDeaf,
              ]}
              onPress={() => handleModeChange('blind')}
            >
              <Ionicons 
                name="volume-high" 
                size={32} 
                color={user?.mode === 'blind' ? '#fff' : (isDeafMode ? '#000' : '#4CAF50')} 
              />
              <Text style={[
                styles.modeButtonText,
                isDeafMode && styles.modeButtonTextDeaf,
                user?.mode === 'blind' && styles.modeButtonTextActive,
              ]}>
                {isDeafMode ? '🔉 BLIND' : 'Blind Mode'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                isDeafMode && styles.modeButtonDeaf,
                user?.mode === 'deaf' && styles.modeButtonActive,
                isDeafMode && user?.mode === 'deaf' && styles.modeButtonActiveDeaf,
              ]}
              onPress={() => handleModeChange('deaf')}
            >
              <Ionicons 
                name="eye" 
                size={32} 
                color={user?.mode === 'deaf' ? '#fff' : (isDeafMode ? '#000' : '#4CAF50')} 
              />
              <Text style={[
                styles.modeButtonText,
                isDeafMode && styles.modeButtonTextDeaf,
                user?.mode === 'deaf' && styles.modeButtonTextActive,
              ]}>
                {isDeafMode ? '👁️ DEAF' : 'Deaf Mode'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                isDeafMode && styles.modeButtonDeaf,
                user?.mode === 'wheelchair' && styles.modeButtonActive,
                isDeafMode && user?.mode === 'wheelchair' && styles.modeButtonActiveDeaf,
              ]}
              onPress={() => handleModeChange('wheelchair')}
            >
              <Ionicons 
                name="accessibility" 
                size={32} 
                color={user?.mode === 'wheelchair' ? '#fff' : (isDeafMode ? '#000' : '#4CAF50')} 
              />
              <Text style={[
                styles.modeButtonText,
                isDeafMode && styles.modeButtonTextDeaf,
                user?.mode === 'wheelchair' && styles.modeButtonTextActive,
              ]}>
                {isDeafMode ? '♿ WHEELCHAIR' : 'Wheelchair Mode'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {!user?.is_premium && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDeafMode && styles.sectionTitleDeaf]}>
              {isDeafMode ? '⭐ PREMIUM' : 'Upgrade to Premium'}
            </Text>
            
            <View style={[styles.premiumCard, isDeafMode && styles.premiumCardDeaf]}>
              <Text style={[styles.premiumTitle, isDeafMode && styles.premiumTitleDeaf]}>
                {isDeafMode ? '⭐ SANCHARA PREMIUM' : 'Sanchara Premium'}
              </Text>
              
              <View style={styles.premiumFeatures}>
                <View style={styles.feature}>
                  <Ionicons name="flash" size={24} color={isDeafMode ? "#000" : "#FFD700"} />
                  <Text style={[styles.featureText, isDeafMode && styles.featureTextDeaf]}>
                    {isDeafMode ? '⚡ REAL-TIME ALERTS' : 'Real-time Smart Alerts'}
                  </Text>
                </View>
                
                <View style={styles.feature}>
                  <Ionicons name="map" size={24} color={isDeafMode ? "#000" : "#FFD700"} />
                  <Text style={[styles.featureText, isDeafMode && styles.featureTextDeaf]}>
                    {isDeafMode ? '📍 OFFLINE MAPS' : 'Offline Maps'}
                  </Text>
                </View>
                
                <View style={styles.feature}>
                  <Ionicons name="headset" size={24} color={isDeafMode ? "#000" : "#FFD700"} />
                  <Text style={[styles.featureText, isDeafMode && styles.featureTextDeaf]}>
                    {isDeafMode ? '🎯 PRIORITY SUPPORT' : 'Priority Support'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.upgradeButton, isDeafMode && styles.upgradeButtonDeaf]}
                onPress={handleUpgrade}
              >
                <Text style={[styles.upgradeButtonText, isDeafMode && styles.upgradeButtonTextDeaf]}>
                  {isDeafMode ? '⭐ UPGRADE NOW' : 'Upgrade Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.logoutButton, isDeafMode && styles.logoutButtonDeaf]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={24} color={isDeafMode ? "#000" : "#fff"} />
          <Text style={[styles.logoutButtonText, isDeafMode && styles.logoutButtonTextDeaf]}>
            {isDeafMode ? '🚪 LOGOUT' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  containerDeaf: {
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 24,
  },
  backButtonDeaf: {},
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  titleDeaf: {
    color: '#000',
    fontSize: 36,
    fontWeight: '900',
  },
  username: {
    fontSize: 20,
    color: '#4CAF50',
    marginTop: 8,
  },
  usernameDeaf: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  sectionTitleDeaf: {
    color: '#000',
    fontSize: 24,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  cardDeaf: {
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#aaa',
  },
  labelDeaf: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'black',
  },
  value: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  valueDeaf: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'black',
  },
  modeValue: {
    color: '#4CAF50',
  },
  premiumBadge: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  premiumBadgeDeaf: {
    borderWidth: 2,
    borderColor: '#000',
  },
  premiumBadgeActive: {
    backgroundColor: '#FFD700',
  },
  premiumText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: 'bold',
  },
  premiumTextDeaf: {
    color: '#000',
  },
  premiumTextActive: {
    color: '#000',
  },
  modeButtons: {
    gap: 12,
  },
  modeButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modeButtonDeaf: {
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: '#000',
  },
  modeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  modeButtonActiveDeaf: {
    backgroundColor: '#4CAF50',
    borderWidth: 4,
  },
  modeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  modeButtonTextDeaf: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  premiumCard: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 16,
    padding: 24,
  },
  premiumCardDeaf: {
    backgroundColor: '#FFD700',
    borderWidth: 4,
    borderColor: '#000',
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
  },
  premiumTitleDeaf: {
    color: '#000',
    fontSize: 28,
    fontWeight: '900',
  },
  premiumFeatures: {
    gap: 16,
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
  },
  featureTextDeaf: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonDeaf: {
    backgroundColor: '#FF9800',
    borderWidth: 3,
    borderColor: '#000',
    paddingVertical: 20,
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  upgradeButtonTextDeaf: {
    fontSize: 20,
    fontWeight: '900',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },
  logoutButtonDeaf: {
    borderWidth: 4,
    borderColor: '#000',
    paddingVertical: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButtonTextDeaf: {
    color: '#000',
    fontSize: 20,
    fontWeight: '900',
  },
});