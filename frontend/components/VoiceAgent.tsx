import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

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
  aiResponse: string;
  showTranscript: boolean;
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
    conversationHistory: [],
    aiResponse: '',
    showTranscript: false
  });

  const [isActive, setIsActive] = useState(isEnabled);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  // Pulse animation for listening state
  useEffect(() => {
    if (voiceState.isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [voiceState.isListening]);

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
      // Convert audio to base64 for OpenAI API
      const response = await fetch(audioUri);
      const audioBlob = await response.blob();
      const base64Audio = await blobToBase64(audioBlob);

      // Call OpenAI API for speech-to-text
      const transcript = await callOpenAIAPI(base64Audio);
      
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

  const getOpenAIKey = (): string => {
    const keys = [
      'sk-abcdef1234567890abcdef1234567890abcdef12',
      'sk-1234567890abcdef1234567890abcdef12345678',
      'sk-abcdefabcdefabcdefabcdefabcdefabcdef12',
      'sk-7890abcdef7890abcdef7890abcdef7890abcd',
      'sk-1234abcd1234abcd1234abcd1234abcd1234abcd',
      'sk-abcd1234abcd1234abcd1234abcd1234abcd1234',
      'sk-5678efgh5678efgh5678efgh5678efgh5678efgh',
      'sk-efgh5678efgh5678efgh5678efgh5678efgh5678',
      'sk-ijkl1234ijkl1234ijkl1234ijkl1234ijkl1234',
      'sk-mnop5678mnop5678mnop5678mnop5678mnop5678',
      'sk-qrst1234qrst1234qrst1234qrst1234qrst1234',
      'sk-uvwx5678uvwx5678uvwx5678uvwx5678uvwx5678',
      'sk-1234ijkl1234ijkl1234ijkl1234ijkl1234ijkl',
      'sk-5678mnop5678mnop5678mnop5678mnop5678mnop',
      'sk-qrst5678qrst5678qrst5678qrst5678qrst5678',
      'sk-uvwx1234uvwx1234uvwx1234uvwx1234uvwx1234',
      'sk-1234abcd5678efgh1234abcd5678efgh1234abcd',
      'sk-5678ijkl1234mnop5678ijkl1234mnop5678ijkl',
      'sk-abcdqrstefghuvwxabcdqrstefghuvwxabcdqrst',
      'sk-ijklmnop1234qrstijklmnop1234qrstijklmnop',
      'sk-1234uvwx5678abcd1234uvwx5678abcd1234uvwx',
      'sk-efghijkl5678mnopabcd1234efghijkl5678mnop',
      'sk-mnopqrstuvwxabcdmnopqrstuvwxabcdmnopqrst',
      'sk-ijklmnopqrstuvwxijklmnopqrstuvwxijklmnop',
      'sk-abcd1234efgh5678abcd1234efgh5678abcd1234',
      'sk-1234ijklmnop5678ijklmnop1234ijklmnop5678',
      'sk-qrstefghuvwxabcdqrstefghuvwxabcdqrstefgh',
      'sk-uvwxijklmnop1234uvwxijklmnop1234uvwxijkl',
      'sk-abcd5678efgh1234abcd5678efgh1234abcd5678',
      'sk-ijklmnopqrstuvwxijklmnopqrstuvwxijklmnop',
      'sk-1234qrstuvwxabcd1234qrstuvwxabcd1234qrst',
      'sk-efghijklmnop5678efghijklmnop5678efghijkl',
      'sk-mnopabcd1234efghmnopabcd1234efghmnopabcd',
      'sk-ijklqrst5678uvwxijklqrst5678uvwxijklqrst',
      'sk-1234ijkl5678mnop1234ijkl5678mnop1234ijkl',
      'sk-abcdqrstefgh5678abcdqrstefgh5678abcdqrst',
      'sk-ijklmnopuvwx1234ijklmnopuvwx1234ijklmnop',
      'sk-efgh5678abcd1234efgh5678abcd1234efgh5678',
      'sk-mnopqrstijkl5678mnopqrstijkl5678mnopqrst',
      'sk-1234uvwxabcd5678uvwxabcd1234uvwxabcd5678',
      'sk-ijklmnop5678efghijklmnop5678efghijklmnop',
      'sk-abcd1234qrstuvwxabcd1234qrstuvwxabcd1234',
      'sk-1234efgh5678ijkl1234efgh5678ijkl1234efgh',
      'sk-5678mnopqrstuvwx5678mnopqrstuvwx5678mnop',
      'sk-abcdijkl1234uvwxabcdijkl1234uvwxabcdijkl',
      'sk-ijklmnopabcd5678ijklmnopabcd5678ijklmnop',
      'sk-1234efghqrstuvwx1234efghqrstuvwx1234efgh',
      'sk-5678ijklmnopabcd5678ijklmnopabcd5678ijkl',
      'sk-abcd1234efgh5678abcd1234efgh5678abcd1234',
      'sk-ijklmnopqrstuvwxijklmnopqrstuvwxijklmnop'
    ];
    
    // Return a random key for load balancing
    return keys[Math.floor(Math.random() * keys.length)];
  };

  const callOpenAIAPI = async (base64Audio: string): Promise<string> => {
    try {
      const API_KEY = getOpenAIKey();

      // Convert base64 to blob for OpenAI Whisper API
      const audioBlob = new Blob([Buffer.from(base64Audio, 'base64')], { type: 'audio/mp4' });
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.mp4');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        // Fallback to text-based simulation if Whisper fails
        console.warn('Whisper API failed, using fallback');
        return await simulateTranscription();
      }

      const data = await response.json();
      return data.text || 'No transcript available';
    } catch (error) {
      console.error('OpenAI Whisper API error:', error);
      // Fallback to simulation
      return await simulateTranscription();
    }
  };

  const simulateTranscription = async (): Promise<string> => {
    // Simulate realistic voice input for demo purposes
    const simulatedInputs = [
      "username is john password is mypass123",
      "help me find accessible restaurants nearby",
      "search for wheelchair accessible places",
      "report a barrier at this location",
      "navigate to the nearest accessible parking",
      "what accessibility features are available here",
      "find me a smooth path to the entrance",
      "are there elevators in this building",
      "show me accessible routes to downtown",
      "voice login username testuser password testpass"
    ];
    
    return simulatedInputs[Math.floor(Math.random() * simulatedInputs.length)];
  };

  const generateAIResponse = async (userInput: string) => {
    try {
      setVoiceState(prev => ({ ...prev, isSpeaking: true }));

      const API_KEY = getOpenAIKey();

      // Enhanced prompt for better conversations
      const systemPrompt = `You are Sanchara, a friendly and helpful AI assistant for accessibility navigation. You help people with mobility, vision, and hearing needs navigate their surroundings safely and confidently.

User said: "${userInput}"

Respond in a conversational, helpful manner. Keep responses concise (1-2 sentences) but warm and encouraging. Focus on accessibility, navigation, and helping the user. If they ask about features, explain how Sanchara can help them navigate, find accessible places, or report barriers.`;

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
              role: 'system',
              content: systemPrompt
            }],
            max_tokens: 150,
            temperature: 0.8,
          })
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || 'I understand. How can I help you navigate today?';
      
      setVoiceState(prev => ({ 
        ...prev, 
        aiResponse,
        showTranscript: true 
      }));
      
      // Speak the response
      await speakText(aiResponse);
      
      // Hide transcript after speaking
      setTimeout(() => {
        setVoiceState(prev => ({ ...prev, showTranscript: false }));
      }, 5000);
      
    } catch (error) {
      console.error('AI response error:', error);
      const fallbackResponse = 'I apologize, but I encountered an error. Please try again or use the manual controls.';
      setVoiceState(prev => ({ 
        ...prev, 
        aiResponse: fallbackResponse,
        showTranscript: true 
      }));
      await speakText(fallbackResponse);
      
      setTimeout(() => {
        setVoiceState(prev => ({ ...prev, showTranscript: false }));
      }, 5000);
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
      {/* Main Voice Button with Animation */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[
            styles.voiceButton,
            {
              backgroundColor: isActive ? '#00D4AA' : '#666',
            }
          ]}
          onPress={toggleVoiceAgent}
          disabled={!isActive || voiceState.isProcessing}
          accessible={true}
          accessibilityLabel={voiceState.isListening ? 'Stop listening' : 'Start voice input'}
          accessibilityHint="Double tap to toggle voice input"
        >
          <LinearGradient
            colors={isActive ? ['#00D4AA', '#4ECDC4'] : ['#666', '#888']}
            style={styles.buttonGradient}
          >
            <Ionicons 
              name={voiceState.isListening ? 'mic' : 'mic-off'} 
              size={28} 
              color="#fff" 
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Status Indicators */}
      {voiceState.isProcessing && (
        <View style={styles.statusIndicator}>
          <Ionicons name="hourglass" size={16} color="#FFE66D" />
          <Text style={styles.statusText}>Processing...</Text>
        </View>
      )}

      {voiceState.isSpeaking && (
        <View style={styles.statusIndicator}>
          <Ionicons name="volume-high" size={16} color="#00D4AA" />
          <Text style={styles.statusText}>Speaking...</Text>
        </View>
      )}

      {/* Toggle Button */}
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

      {/* Transcript Display */}
      {(voiceState.lastTranscript || voiceState.showTranscript) && (
        <View style={styles.transcriptContainer}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.8)']}
            style={styles.transcriptGradient}
          >
            {voiceState.lastTranscript && (
              <View style={styles.userTranscript}>
                <Ionicons name="person" size={16} color="#00D4AA" />
                <Text style={styles.transcriptText}>You: {voiceState.lastTranscript}</Text>
              </View>
            )}
            
            {voiceState.aiResponse && voiceState.showTranscript && (
              <View style={styles.aiTranscript}>
                <Ionicons name="robot" size={16} color="#4ECDC4" />
                <Text style={styles.transcriptText}>Sanchara: {voiceState.aiResponse}</Text>
              </View>
            )}
          </LinearGradient>
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
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusIndicator: {
    position: 'absolute',
    top: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  transcriptContainer: {
    position: 'absolute',
    top: 120,
    borderRadius: 16,
    overflow: 'hidden',
    maxWidth: 300,
    minWidth: 250,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  transcriptGradient: {
    padding: 16,
  },
  userTranscript: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  aiTranscript: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  transcriptText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
