# Deafy - Advanced Sign Language Detection Web App

A real-time sign language detection application built with React and MediaPipe. This application can detect and classify hand signs for the following gestures:

## Custom Signs (20):
- Peace, OK, Rock, Paper, Scissors, Love, Victory, Thumbs Up, Thumbs Down, Point, Wave, Fist, Open Hand, Pinch, Gun, Phone, Money, Stop, Go, Wait

## Alphabet Signs (26):
- A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z

**Total: 46 different signs supported!**

## Features

- Real-time hand detection using MediaPipe
- Advanced gesture recognition using custom finger state analysis
- Live camera feed with hand landmark visualization
- Real-time sign detection and display
- Responsive design for mobile and desktop
- Support for 46 different signs (20 custom + 26 alphabet)
- No machine learning model required - works instantly

## Prerequisites

- Node.js (v16 or higher)
- Webcam access

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd deafy-web-app
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Ready to use!**
   
   The application uses advanced finger state analysis and doesn't require any machine learning model conversion. It works instantly with MediaPipe hand detection.

## Usage

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to `http://localhost:5173`

3. **Grant camera permissions**
   When prompted, allow the application to access your webcam.

4. **Start detection**
   Click the "Start Camera" button to begin real-time sign language detection.

5. **Make signs**
   Show your hand to the camera and make one of the supported signs:
   - **Custom signs**: Peace, OK, Rock, Paper, Scissors, Love, Victory, Thumbs Up, Thumbs Down, Point, Wave, Fist, Open Hand, Pinch, Gun, Phone, Money, Stop, Go, Wait
   - **Alphabet signs**: A-Z (all 26 letters)

## How it Works

1. **Hand Detection**: MediaPipe Hands detects hand landmarks in real-time from the camera feed
2. **Finger State Analysis**: The 21 hand landmarks are analyzed to determine which fingers are extended or curled
3. **Gesture Recognition**: Custom algorithms check finger states against predefined sign patterns
4. **Real-time Detection**: Signs are detected instantly without requiring machine learning inference
5. **Visualization**: Hand landmarks are drawn on the video feed with detected sign labels

## Advanced Detection System

The application uses a sophisticated finger state analysis system that:

- Analyzes the position of all 21 hand landmarks
- Determines which fingers are extended or curled
- Matches finger patterns against 46 predefined signs
- Provides instant detection without machine learning inference
- Works reliably across different hand sizes and orientations

## Project Structure

```
deafy-web-app/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── SignLanguageDetector.jsx
│   │   └── SignLanguageDetector.css
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
└── package.json
```

## Troubleshooting

### Camera Access Issues
- Make sure your browser supports WebRTC
- Check that you've granted camera permissions
- Try refreshing the page and granting permissions again

### Detection Issues
- Ensure good lighting conditions for better hand detection
- Keep your hand clearly visible in the camera frame
- Try different hand orientations if detection is inconsistent

### Performance Issues
- Close other applications using the camera
- Reduce the camera resolution if needed
- Ensure you have a modern browser with WebGL support

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [MediaPipe](https://mediapipe.dev/) for hand detection and tracking
- [React](https://reactjs.org/) for the user interface
- [Vite](https://vitejs.dev/) for the build tool
