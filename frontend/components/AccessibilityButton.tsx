import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AccessibilityButtonProps {
  onPress: () => void;
  title: string;
  subtitle?: string;
  icon: string;
  color?: string;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: any;
}

export default function AccessibilityButton({
  onPress,
  title,
  subtitle,
  icon,
  color = '#fff',
  backgroundColor = '#4CAF50',
  size = 'medium',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: AccessibilityButtonProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: 12,
          iconSize: 20,
          fontSize: 14,
        };
      case 'large':
        return {
          padding: 24,
          iconSize: 40,
          fontSize: 20,
        };
      default:
        return {
          padding: 16,
          iconSize: 32,
          fontSize: 16,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled ? '#666' : backgroundColor,
          padding: sizeStyles.padding,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View style={styles.content}>
        <Ionicons 
          name={icon as any} 
          size={sizeStyles.iconSize} 
          color={disabled ? '#999' : color} 
        />
        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            {
              color: disabled ? '#999' : color,
              fontSize: sizeStyles.fontSize,
            }
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[
              styles.subtitle,
              {
                color: disabled ? '#999' : color,
                opacity: 0.8,
              }
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginVertical: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
