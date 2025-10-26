# Sanchara - Enhanced Accessibility Navigation App

## 🚀 New Features Added

### 🎤 Voice Agent AI (Powered by Gemini Live API)
- **Voice Authentication**: Login using voice commands
- **Conversational AI**: Natural language interaction with Sanchara
- **Voice Navigation**: Control the app using voice commands
- **Speech-to-Text**: Convert speech to text for all inputs
- **Text-to-Speech**: AI responses are spoken back to you

### 📍 Current Location Sanchara Score
- **Real-time Accessibility Scoring**: Get instant accessibility scores for your current location
- **Feature Detection**: Automatically detects accessibility features
- **Visual Score Display**: Beautiful score visualization with color coding
- **Location-based Insights**: Understand accessibility infrastructure around you

### 🎨 Enhanced UI/UX Design
- **Modern Glass-morphism Design**: Beautiful translucent headers with blur effects
- **Enhanced Location Cards**: Improved card design with better visual hierarchy
- **Floating Action Buttons**: Modern gradient buttons with glow effects
- **Improved Accessibility**: Better contrast, larger touch targets, and screen reader support

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
# or
yarn install
```

### 2. Configure Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Create a `.env` file in the frontend directory:
```bash
# In frontend directory
touch .env
```

4. Add your API key to the `.env` file:
```bash
EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 3. Start the Development Server
```bash
npm start
# or
yarn start
```

## 🎯 Voice Agent Features

### Voice Authentication
- Say "username is [your_username]" and "password is [your_password]"
- The AI will automatically fill in the login form
- Supports natural language patterns

### Voice Commands
- **Navigation**: "Go to search", "Open menu", "Show profile"
- **Actions**: "Find accessible places", "Report barrier", "Search for restaurants"
- **General**: "Help", "What can you do?", "Tell me about accessibility"

### Conversational AI
- Ask questions about accessibility features
- Get recommendations for accessible locations
- Receive guidance on navigation

## 📱 UI/UX Improvements

### Enhanced Header Component
- Glass-morphism design with blur effects
- Voice toggle button with visual feedback
- Improved accessibility with better contrast
- Smooth animations and transitions

### Location Cards
- Modern card design with gradients
- Better visual hierarchy
- Improved feature display
- Enhanced touch targets

### Floating Action Buttons
- Gradient backgrounds with glow effects
- Better visual feedback
- Improved accessibility labels
- Smooth animations

## 🔧 Technical Implementation

### Voice Agent Architecture
- **Audio Recording**: Uses Expo AV for high-quality audio capture
- **Speech Processing**: Gemini API for speech-to-text conversion
- **AI Responses**: Gemini API for natural language processing
- **Text-to-Speech**: Expo Speech for voice output

### Current Location Scoring
- **Location Services**: Expo Location for GPS coordinates
- **Reverse Geocoding**: Convert coordinates to addresses
- **Accessibility Analysis**: Backend API for score calculation
- **Feature Detection**: Automatic detection of accessibility features

### Enhanced Components
- **Modular Design**: Reusable components for consistency
- **TypeScript**: Full type safety and better development experience
- **Accessibility**: WCAG compliant with screen reader support
- **Performance**: Optimized rendering and smooth animations

## 🎨 Design System

### Color Palette
- **Primary**: #00D4AA (Teal)
- **Secondary**: #4ECDC4 (Light Teal)
- **Warning**: #FFE66D (Yellow)
- **Error**: #FF6B6B (Red)
- **Background**: #000000 (Black)
- **Surface**: #1a1a1a (Dark Gray)

### Typography
- **Headers**: Bold, 20-24px
- **Body**: Regular, 14-16px
- **Captions**: Medium, 12-14px
- **Accessibility**: High contrast ratios

### Spacing
- **Small**: 8px
- **Medium**: 16px
- **Large**: 24px
- **Extra Large**: 32px

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up environment variables**: Add your Gemini API key
4. **Start the development server**: `npm start`
5. **Enable voice agent**: Voice agent is enabled by default
6. **Test voice authentication**: Try logging in with voice commands
7. **Explore the enhanced UI**: Navigate through the improved interface

## 📞 Support

For issues or questions:
- Check the troubleshooting section in the environment setup
- Ensure all dependencies are properly installed
- Verify API keys are correctly configured
- Check device permissions for microphone access

## 🔮 Future Enhancements

- **Multi-language Support**: Voice agent in multiple languages
- **Offline Mode**: Basic functionality without internet
- **AR Navigation**: Augmented reality for indoor navigation
- **Community Features**: User-generated accessibility reports
- **Integration**: Connect with other accessibility apps and services
