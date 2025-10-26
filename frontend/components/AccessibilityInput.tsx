import React from 'react';
import { TextInput, Text, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AccessibilityInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: any;
  isDeafMode?: boolean;
}

export default function AccessibilityInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  isDeafMode = false,
}: AccessibilityInputProps) {
  const inputStyles = [
    styles.input,
    isDeafMode && styles.inputDeaf,
    error && styles.inputError,
    disabled && styles.inputDisabled,
    style,
  ];

  const labelStyles = [
    styles.label,
    isDeafMode && styles.labelDeaf,
    error && styles.labelError,
  ];

  return (
    <View style={styles.container}>
      <Text style={labelStyles}>
        {label}
        {error && ' *'}
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={inputStyles}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDeafMode ? '#666' : '#666'}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          accessible={true}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
        />
        
        {secureTextEntry && (
          <View style={styles.iconContainer}>
            <Ionicons 
              name="eye-off" 
              size={20} 
              color={isDeafMode ? '#000' : '#666'} 
            />
          </View>
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={16} color="#F44336" />
          <Text style={[styles.errorText, isDeafMode && styles.errorTextDeaf]}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 8,
  },
  labelDeaf: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'black',
  },
  labelError: {
    color: '#F44336',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputDeaf: {
    backgroundColor: '#f0f0f0',
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    borderWidth: 3,
    borderColor: '#000',
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: '#1a1a1a',
  },
  iconContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
  },
  errorTextDeaf: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
