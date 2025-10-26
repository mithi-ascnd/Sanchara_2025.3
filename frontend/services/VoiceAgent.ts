import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VoiceAgentProps {
  onTextReceived?: (text: string) => void;
  onAuthData?: (username: string, password: string) => void;
  isEnabled?: boolean;
  mode?: 'conversation' | 'auth';
}

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  lastTranscript: string;
  conversationHistory: string[];
}

export default function VoiceAgent({ 
  onTextReceived, 
  onAuthData, 
  isEnabled = true, 
  mode = 'conversation' 
}: VoiceAgentProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    lastTranscript: '',
    conversationHistory: []
  });

  const [isActive, setIsActive] = useState(isEnabled);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    initializeAudio();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isActive && mode === 'conversation') {
      startConversation();
    }
  }, [isActive, mode]);

  const initializeAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  };

  const cleanup = async () => {
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
    }
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
  };

  const startRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      recordingRef.current = recording;

      setVoiceState(prev => ({ ...prev, isListening: true }));
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start voice recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      setVoiceState(prev => ({ ...prev, isListening: false, isProcessing: true }));

      if (uri) {
        await processAudio(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setVoiceState(prev => ({ ...prev, isListening: false, isProcessing: false }));
    }
  };

  const processAudio = async (audioUri: string) => {
    try {
      // Convert audio to base64 for Gemini API
      const response = await fetch(audioUri);
      const audioBlob = await response.blob();
      const base64Audio = await blobToBase64(audioBlob);

      // Call Gemini Live API for speech-to-text
      const transcript = await callGeminiAPI(base64Audio);
      
      setVoiceState(prev => ({
        ...prev,
        lastTranscript: transcript,
        conversationHistory: [...prev.conversationHistory, transcript],
        isProcessing: false
      }));

      // Handle the transcript based on mode
      if (mode === 'auth') {
        handleAuthTranscript(transcript);
      } else {
        onTextReceived?.(transcript);
        // Generate AI response
        await generateAIResponse(transcript);
      }
    } catch (error) {
      console.error('Failed to process audio:', error);
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
      Alert.alert('Error', 'Failed to process voice input');
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:audio/...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const callGeminiAPI = async (base64Audio: string): Promise<string> => {
    try {
      const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!API_KEY) {
        throw new Error('Gemini API key not found');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Transcribe the following audio to text. Return only the transcribed text without any additional formatting or explanation."
              }, {
                inline_data: {
                  mime_type: "audio/mp4",
                  data: base64Audio
                }
              }]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1000,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No transcript available';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  };

  const generateAIResponse = async (userInput: string) => {
    try {
      setVoiceState(prev => ({ ...prev, isSpeaking: true }));

      const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!API_KEY) {
        throw new Error('Gemini API key not found');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are Sanchara, an AI assistant for accessibility navigation. Respond to this user input in a helpful, friendly manner: "${userInput}". Keep responses concise and helpful for accessibility needs.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I understand. How can I help you?';
      
      // Speak the response
      await speakText(aiResponse);
    } catch (error) {
      console.error('AI response error:', error);
      await speakText('I apologize, but I encountered an error. Please try again.');
    } finally {
      setVoiceState(prev => ({ ...prev, isSpeaking: false }));
    }
  };

  const speakText = async (text: string) => {
    try {
      await Speech.speak(text, {
        language: 'en',
        pitch: 1.0,
        rate: 0.9,
        quality: Speech.VoiceQuality.Enhanced,
      });
    } catch (error) {
      console.error('Speech error:', error);
    }
  };

  const handleAuthTranscript = (transcript: string) => {
    // Simple parsing for auth mode - look for username and password patterns
    const lowerTranscript = transcript.toLowerCase();
    
    // Look for patterns like "username is john" or "my username is john"
    const usernameMatch = transcript.match(/(?:username|user name)\s+(?:is\s+)?(\w+)/i);
    const passwordMatch = transcript.match(/(?:password|pass)\s+(?:is\s+)?(\w+)/i);
    
    if (usernameMatch && passwordMatch) {
      onAuthData?.(usernameMatch[1], passwordMatch[1]);
    } else {
      // Ask for clarification
      speakText('Please say your username and password. For example, say "username is john" and "password is mypass123"');
    }
  };

  const startConversation = async () => {
    await speakText('Hello! I\'m Sanchara, your accessibility assistant. How can I help you navigate today?');
  };

  const toggleVoiceAgent = async () => {
    if (voiceState.isListening) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const toggleActive = () => {
    setIsActive(!isActive);
    if (!isActive) {
      startConversation();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.voiceButton,
          {
            backgroundColor: isActive ? '#00D4AA' : '#666',
            transform: [{ scale: voiceState.isListening ? 1.1 : 1 }]
          }
        ]}
        onPress={toggleVoiceAgent}
        disabled={!isActive || voiceState.isProcessing}
        accessible={true}
        accessibilityLabel={voiceState.isListening ? 'Stop listening' : 'Start voice input'}
        accessibilityHint="Double tap to toggle voice input"
      >
        <Ionicons 
          name={voiceState.isListening ? 'mic' : 'mic-off'} 
          size={24} 
          color="#fff" 
        />
      </TouchableOpacity>

      {voiceState.isProcessing && (
        <View style={styles.processingIndicator}>
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}

      {voiceState.isSpeaking && (
        <View style={styles.speakingIndicator}>
          <Text style={styles.speakingText}>Speaking...</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={toggleActive}
        accessible={true}
        accessibilityLabel={isActive ? 'Disable voice agent' : 'Enable voice agent'}
      >
        <Ionicons 
          name={isActive ? 'volume-high' : 'volume-mute'} 
          size={16} 
          color={isActive ? '#00D4AA' : '#666'} 
        />
      </TouchableOpacity>

      {voiceState.lastTranscript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptText}>{voiceState.lastTranscript}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
  },
  voiceButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toggleButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingIndicator: {
    position: 'absolute',
    top: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  processingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  speakingIndicator: {
    position: 'absolute',
    top: 70,
    backgroundColor: 'rgba(0, 212, 170, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  speakingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  transcriptContainer: {
    position: 'absolute',
    top: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 12,
    borderRadius: 8,
    maxWidth: 250,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.3)',
  },
  transcriptText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
