import React, { useRef, useEffect, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import './SignLanguageDetector.css';

const SignLanguageDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedSigns, setDetectedSigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define all available signs
  const customSigns = {
    'Peace': isPeaceSign,
    'OK': isOkSign,
    'Rock': isRockSign,
    'Paper': isPaperSign,
    'Scissors': isScissorsSign,
    'Love': isLoveSign,
    'Victory': isVictorySign,
    'Thumbs Up': isThumbsUp,
    'Thumbs Down': isThumbsDown,
    'Point': isPointSign,
    'Wave': isWaveSign,
    'Fist': isFistSign,
    'Open Hand': isOpenHand,
    'Pinch': isPinchSign,
    'Gun': isGunSign,
    'Phone': isPhoneSign,
    'Money': isMoneySign,
    'Stop': isStopSign,
    'Go': isGoSign,
    'Wait': isWaitSign
  };

  const alphabetSigns = {
    'A': isGestureA,
    'B': isGestureB,
    'C': isGestureC,
    'D': isGestureD,
    'E': isGestureE,
    'F': isGestureF,
    'G': isGestureG,
    'H': isGestureH,
    'I': isGestureI,
    'J': isGestureJ,
    'K': isGestureK,
    'L': isGestureL,
    'M': isGestureM,
    'N': isGestureN,
    'O': isGestureO,
    'P': isGestureP,
    'Q': isGestureQ,
    'R': isGestureR,
    'S': isGestureS,
    'T': isGestureT,
    'U': isGestureU,
    'V': isGestureV,
    'W': isGestureW,
    'X': isGestureX,
    'Y': isGestureY,
    'Z': isGestureZ
  };

  const allSigns = { ...customSigns, ...alphabetSigns };

  // Initialize MediaPipe Hands
  const hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5
  });

  // Get finger states from landmarks
  const getFingerState = (landmarks, frameWidth, frameHeight) => {
    // Define finger tip indices
    const fingerTips = [4, 8, 12, 16, 20]; // thumb, index, middle, ring, pinky
    const fingerPips = [3, 7, 11, 15, 19]; // finger pip joints

    const fingerStates = [];
    
    for (let i = 0; i < fingerTips.length; i++) {
      const tip = fingerTips[i];
      const pip = fingerPips[i];
      
      // For thumb, check if it's extended to the side
      if (i === 0) { // thumb
        if (landmarks[tip].x > landmarks[pip].x) {
          fingerStates.push(true);
        } else {
          fingerStates.push(false);
        }
      } else {
        // For other fingers, check if tip is above pip
        if (landmarks[tip].y < landmarks[pip].y) {
          fingerStates.push(true);
        } else {
          fingerStates.push(false);
        }
      }
    }
    
    return fingerStates;
  };

  // ===== CUSTOM SIGN DETECTION FUNCTIONS =====
  
  function isPeaceSign(fingerStates) {
    // Peace: Index and middle finger extended, others curled
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isOkSign(fingerStates) {
    // OK: Thumb and index finger forming a circle, other fingers extended
    return fingerStates[2] && fingerStates[3] && fingerStates[4];
  }

  function isRockSign(fingerStates) {
    // Rock: Fist with thumb extended
    return fingerStates[0] && !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isPaperSign(fingerStates) {
    // Paper: All fingers extended
    return fingerStates.every(state => state);
  }

  function isScissorsSign(fingerStates) {
    // Scissors: Index and middle finger extended in V shape
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isLoveSign(fingerStates) {
    // Love: Thumb and index finger forming heart shape, others extended
    return fingerStates[2] && fingerStates[3] && fingerStates[4];
  }

  function isVictorySign(fingerStates) {
    // Victory: Index and middle finger extended in V shape
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isThumbsUp(fingerStates) {
    // Thumbs Up: Thumb extended upward, others curled
    return fingerStates[0] && !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isThumbsDown(fingerStates) {
    // Thumbs Down: Thumb pointing down, others curled
    return fingerStates[0] && !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isPointSign(fingerStates) {
    // Point: Index finger extended, others curled
    return fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isWaveSign(fingerStates) {
    // Wave: All fingers extended and moving
    return fingerStates.slice(1).every(state => state);
  }

  function isFistSign(fingerStates) {
    // Fist: All fingers curled
    return !fingerStates.some(state => state);
  }

  function isOpenHand(fingerStates) {
    // Open Hand: All fingers extended
    return fingerStates.slice(1).every(state => state);
  }

  function isPinchSign(fingerStates) {
    // Pinch: Thumb and index finger touching, others extended
    return fingerStates[2] && fingerStates[3] && fingerStates[4];
  }

  function isGunSign(fingerStates) {
    // Gun: Index finger extended, thumb up, others curled
    return fingerStates[0] && fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isPhoneSign(fingerStates) {
    // Phone: Thumb and pinky extended, others curled
    return fingerStates[0] && !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && fingerStates[4];
  }

  function isMoneySign(fingerStates) {
    // Money: Thumb and index finger rubbing together
    return fingerStates[2] && fingerStates[3] && fingerStates[4];
  }

  function isStopSign(fingerStates) {
    // Stop: Open palm facing forward
    return fingerStates.slice(1).every(state => state);
  }

  function isGoSign(fingerStates) {
    // Go: Thumb pointing forward
    return fingerStates[0] && !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isWaitSign(fingerStates) {
    // Wait: Hand held up with palm facing forward
    return fingerStates.slice(1).every(state => state);
  }

  // ===== ALPHABET SIGN DETECTION FUNCTIONS =====

  function isGestureA(fingerStates) {
    // A: Fist with thumb on side
    return !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureB(fingerStates) {
    // B: Index and middle finger extended
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureC(fingerStates) {
    // C: Curved fingers like a C shape
    return fingerStates[1] && fingerStates[2] && fingerStates[3] && !fingerStates[4];
  }

  function isGestureD(fingerStates) {
    // D: Index finger extended
    return fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureE(fingerStates) {
    // E: All fingers curled
    return !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureF(fingerStates) {
    // F: Index and thumb touching, other fingers extended
    return fingerStates[1] && fingerStates[2] && fingerStates[3] && fingerStates[4];
  }

  function isGestureG(fingerStates) {
    // G: Index finger pointing
    return fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureH(fingerStates) {
    // H: Index and middle finger extended together
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureI(fingerStates) {
    // I: Pinky extended
    return !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && fingerStates[4];
  }

  function isGestureJ(fingerStates) {
    // J: Pinky extended with motion
    return !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && fingerStates[4];
  }

  function isGestureK(fingerStates) {
    // K: Index and middle finger extended, thumb between them
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureL(fingerStates) {
    // L: Thumb and index finger extended
    return fingerStates[0] && fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureM(fingerStates) {
    // M: Three fingers extended
    return fingerStates[1] && fingerStates[2] && fingerStates[3] && !fingerStates[4];
  }

  function isGestureN(fingerStates) {
    // N: Index and middle finger extended, others curled
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureO(fingerStates) {
    // O: All fingers curled into a circle
    return !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureP(fingerStates) {
    // P: Index and middle finger pointing down
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureQ(fingerStates) {
    // Q: Index finger pointing down
    return fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureR(fingerStates) {
    // R: Index and middle finger crossed
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureS(fingerStates) {
    // S: Fist
    return !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureT(fingerStates) {
    // T: Thumb between index and middle finger
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureU(fingerStates) {
    // U: Index and middle finger extended together
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureV(fingerStates) {
    // V: Index and middle finger extended in V shape
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureW(fingerStates) {
    // W: Three fingers extended
    return fingerStates[1] && fingerStates[2] && fingerStates[3] && !fingerStates[4];
  }

  function isGestureX(fingerStates) {
    // X: Index finger bent
    return !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isGestureY(fingerStates) {
    // Y: Thumb and pinky extended
    return fingerStates[0] && !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && fingerStates[4];
  }

  function isGestureZ(fingerStates) {
    // Z: Index finger drawing Z shape
    return fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  // Detect gesture from finger states
  const detectGesture = (landmarks) => {
    const fingerStates = getFingerState(landmarks, 640, 480);
    
    // Check each sign
    for (const [signName, signCheck] of Object.entries(allSigns)) {
      if (signCheck(fingerStates)) {
        return signName;
      }
    }
    
    return null;
  };

  // Handle hand detection results
  const onResults = (results) => {
    const canvasCtx = canvasRef.current.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    const detected = [];

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        // Draw hand landmarks
        drawConnectors(canvasCtx, landmarks, Hands.HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2
        });
        drawLandmarks(canvasCtx, landmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3
        });

        // Detect gesture
        const detectedGesture = detectGesture(landmarks);
        
        if (detectedGesture) {
          detected.push(detectedGesture);
          
          // Draw gesture name on canvas
          const wrist = landmarks[0];
          const x = wrist.x * canvasRef.current.width;
          const y = wrist.y * canvasRef.current.height - 20;
          
          // Save context, flip text, draw, then restore
          canvasCtx.save();
          canvasCtx.scale(-1, 1);
          canvasCtx.fillStyle = '#00FF00';
          canvasCtx.font = 'bold 24px Arial';
          canvasCtx.fillText(detectedGesture, -x, y);
          canvasCtx.restore();
        }
      }
    }

    setDetectedSigns(detected);
    canvasCtx.restore();
  };

  // Initialize camera
  const startCamera = async () => {
    if (!videoRef.current) return;

    try {
      hands.onResults(onResults);

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480
      });

      await camera.start();
      setIsCameraActive(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error starting camera:', error);
      setIsLoading(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    setIsCameraActive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  useEffect(() => {
    setIsLoading(false);
    return () => {
      stopCamera();
    };
  }, []);

  const customSignsList = Object.keys(customSigns);
  const alphabetSignsList = Object.keys(alphabetSigns);

  return (
    <div className="sign-language-detector">
      <h2>Advanced Sign Language Detection</h2>
      
      {isLoading && (
        <div className="loading">
          <p>Initializing...</p>
        </div>
      )}

      {!isLoading && (
        <>
          <div className="camera-container">
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                transform: 'scaleX(-1)',
                display: 'block',
                objectFit: 'cover'
              }}
              autoPlay
              playsInline
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transform: 'scaleX(-1)'
              }}
            />
          </div>

          <div className="controls">
            {!isCameraActive ? (
              <button onClick={startCamera}>
                Start Camera
              </button>
            ) : (
              <button onClick={stopCamera}>
                Stop Camera
              </button>
            )}
          </div>

          <div className="prediction">
            <h3>Detection Results:</h3>
            {detectedSigns.length > 0 ? (
              detectedSigns.map((sign, index) => (
                <p key={index}>
                  <strong>Detected:</strong> 
                  <span className="detected-sign">{sign}</span>
                </p>
              ))
            ) : (
              <p><strong>Sign:</strong> No sign detected</p>
            )}
          </div>

          <div className="signs-info">
            <div className="custom-signs">
              <h3>Custom Signs ({customSignsList.length}):</h3>
              <div className="signs-grid">
                {customSignsList.map((sign, index) => (
                  <span key={index} className="sign-tag">{sign}</span>
                ))}
              </div>
            </div>

            <div className="alphabet-signs">
              <h3>Alphabet Signs ({alphabetSignsList.length}):</h3>
              <div className="signs-grid">
                {alphabetSignsList.map((sign, index) => (
                  <span key={index} className="sign-tag alphabet">{sign}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="instructions">
            <h3>Instructions:</h3>
            <ul>
              <li>Click "Start Camera" to begin detection</li>
              <li>Show your hand to the camera</li>
              <li>Make one of the supported signs (see above)</li>
              <li>The detected sign will appear in real-time</li>
              <li>Supports {Object.keys(allSigns).length} different signs!</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default SignLanguageDetector;
