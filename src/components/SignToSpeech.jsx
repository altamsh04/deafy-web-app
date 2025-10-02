import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { ArrowLeft, Camera as CameraIcon, Play, Square, BarChart3, Volume2, VolumeX } from 'lucide-react';
import './SignToSpeech.css';

const SignToSpeech = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedSigns, setDetectedSigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSign, setCurrentSign] = useState('');
  const [detectionCount, setDetectionCount] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [lastSpokenSign, setLastSpokenSign] = useState('');
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [detectionFrames, setDetectionFrames] = useState({});
  const [confidenceThreshold] = useState(3);
  const [stableGesture, setStableGesture] = useState('');
  const [gestureStartTime, setGestureStartTime] = useState(null);
  const detectionFramesRef = useRef({});
  const stableGestureRef = useRef('');
  const gestureStartTimeRef = useRef(null);

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

  // Text-to-Speech functionality
  const speakText = (text) => {
    if (!isTTSEnabled || !speechSynthesis) return;
    
    // Cancel any ongoing speech immediately
    speechSynthesis.cancel();
    
    // Create utterance with faster settings for immediate response
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.2; // Faster speech rate
    utterance.pitch = 1.1; // Slightly higher pitch for clarity
    utterance.volume = 0.9; // Higher volume
    
    // Get voices and select the best one
    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Google')
    ) || voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Microsoft')
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    // Speak immediately without delay
    try {
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Speech synthesis error:', error);
    }
  };

  // Initialize MediaPipe Hands
  const hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.7
  });

  // Get finger states from landmarks
  const getFingerState = (landmarks, frameWidth, frameHeight) => {
    const fingerTips = [4, 8, 12, 16, 20];
    const fingerPips = [3, 7, 11, 15, 19];
    const fingerStates = [];
    
    for (let i = 0; i < fingerTips.length; i++) {
      const tip = fingerTips[i];
      const pip = fingerPips[i];
      
      if (i === 0) {
        if (landmarks[tip].x > landmarks[pip].x) {
          fingerStates.push(true);
        } else {
          fingerStates.push(false);
        }
      } else {
        if (landmarks[tip].y < landmarks[pip].y) {
          fingerStates.push(true);
        } else {
          fingerStates.push(false);
        }
      }
    }
    
    return fingerStates;
  };

  // ===== SIGN DETECTION FUNCTIONS =====
  
  function isPeaceSign(fingerStates) {
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isOkSign(fingerStates) {
    return fingerStates[2] && fingerStates[3] && fingerStates[4];
  }

  function isRockSign(fingerStates) {
    return fingerStates[0] && !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isPaperSign(fingerStates) {
    return fingerStates.every(state => state);
  }

  function isScissorsSign(fingerStates) {
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isLoveSign(fingerStates) {
    return fingerStates[2] && fingerStates[3] && fingerStates[4];
  }

  function isVictorySign(fingerStates) {
    return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isThumbsUp(fingerStates) {
    return fingerStates[0] && !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isThumbsDown(fingerStates) {
    return fingerStates[0] && !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isPointSign(fingerStates) {
    return fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isWaveSign(fingerStates) {
    return fingerStates.slice(1).every(state => state);
  }

  function isFistSign(fingerStates) {
    return !fingerStates.some(state => state);
  }

  function isOpenHand(fingerStates) {
    return fingerStates.slice(1).every(state => state);
  }

  function isPinchSign(fingerStates) {
    return fingerStates[2] && fingerStates[3] && fingerStates[4];
  }

  function isGunSign(fingerStates) {
    return fingerStates[0] && fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isPhoneSign(fingerStates) {
    return fingerStates[0] && !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && fingerStates[4];
  }

  function isMoneySign(fingerStates) {
    return fingerStates[2] && fingerStates[3] && fingerStates[4];
  }

  function isStopSign(fingerStates) {
    return fingerStates.slice(1).every(state => state);
  }

  function isGoSign(fingerStates) {
    return fingerStates[0] && !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
  }

  function isWaitSign(fingerStates) {
    return fingerStates.slice(1).every(state => state);
  }

  // Alphabet functions (simplified for brevity)
  function isGestureA(fingerStates) { return !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureB(fingerStates) { return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureC(fingerStates) { return fingerStates[1] && fingerStates[2] && fingerStates[3] && !fingerStates[4]; }
  function isGestureD(fingerStates) { return fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureE(fingerStates) { return !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureF(fingerStates) { return fingerStates[1] && fingerStates[2] && fingerStates[3] && fingerStates[4]; }
  function isGestureG(fingerStates) { return fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureH(fingerStates) { return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureI(fingerStates) { return !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && fingerStates[4]; }
  function isGestureJ(fingerStates) { return !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && fingerStates[4]; }
  function isGestureK(fingerStates) { return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureL(fingerStates) { return fingerStates[0] && fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureM(fingerStates) { return fingerStates[1] && fingerStates[2] && fingerStates[3] && !fingerStates[4]; }
  function isGestureN(fingerStates) { return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureO(fingerStates) { return !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureP(fingerStates) { return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureQ(fingerStates) { return fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureR(fingerStates) { return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureS(fingerStates) { return !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureT(fingerStates) { return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureU(fingerStates) { return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureV(fingerStates) { return fingerStates[1] && fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureW(fingerStates) { return fingerStates[1] && fingerStates[2] && fingerStates[3] && !fingerStates[4]; }
  function isGestureX(fingerStates) { return !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }
  function isGestureY(fingerStates) { return fingerStates[0] && !fingerStates[1] && !fingerStates[2] && !fingerStates[3] && fingerStates[4]; }
  function isGestureZ(fingerStates) { return fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4]; }

  // Detect gesture from finger states
  const detectGesture = (landmarks) => {
    const fingerStates = getFingerState(landmarks, 640, 480);
    
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
        drawConnectors(canvasCtx, landmarks, Hands.HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2
        });
        drawLandmarks(canvasCtx, landmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3
        });

        const detectedGesture = detectGesture(landmarks);
        
        if (detectedGesture) {
          detected.push(detectedGesture);
          
          const wrist = landmarks[0];
          const x = wrist.x * canvasRef.current.width;
          const y = wrist.y * canvasRef.current.height - 20;
          
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
    
    if (detected.length > 0) {
      const newSign = detected[0];
      setCurrentSign(newSign);
      
      // Update detection frames for confidence tracking using refs for immediate access
      detectionFramesRef.current[newSign] = (detectionFramesRef.current[newSign] || 0) + 1;
      
      // Reset other signs' frames
      Object.keys(detectionFramesRef.current).forEach(sign => {
        if (sign !== newSign) {
          detectionFramesRef.current[sign] = 0;
        }
      });
      
      // Update state for UI display
      setDetectionFrames({ ...detectionFramesRef.current });
      
      // Track stable gesture and timing
      if (stableGestureRef.current !== newSign) {
        stableGestureRef.current = newSign;
        gestureStartTimeRef.current = Date.now();
        setStableGesture(newSign);
        setGestureStartTime(Date.now());
      }
      
      // Check if we have enough confidence and stable gesture
      const currentFrames = detectionFramesRef.current[newSign] || 0;
      const currentTime = Date.now();
      const gestureDuration = gestureStartTimeRef.current ? currentTime - gestureStartTimeRef.current : 0;
      
      // Only speak if:
      // 1. We have enough consecutive frames
      // 2. The gesture has been stable for a minimum duration
      // 3. It's a different sign from what we last spoke
      if (currentFrames >= confidenceThreshold && 
          gestureDuration >= 600 && // 600ms minimum stability (reduced for better responsiveness)
          newSign !== lastSpokenSign) {
        console.log(`Speaking: ${newSign} (frames: ${currentFrames}, duration: ${gestureDuration}ms)`);
        speakText(newSign);
        setLastSpokenSign(newSign);
        setDetectionCount(prev => prev + 1);
        gestureStartTimeRef.current = null;
        setGestureStartTime(null);
      } else {
        // Debug logging
        if (currentFrames >= confidenceThreshold && gestureDuration >= 600) {
          console.log(`Would speak ${newSign} but already spoken: ${lastSpokenSign}`);
        } else {
          console.log(`Building confidence for ${newSign}: frames=${currentFrames}/${confidenceThreshold}, duration=${gestureDuration}ms/600ms`);
        }
      }
    } else {
      setCurrentSign('');
      stableGestureRef.current = '';
      gestureStartTimeRef.current = null;
      setStableGesture('');
      setGestureStartTime(null);
      // Reset all detection frames when no sign is detected
      detectionFramesRef.current = {};
      setDetectionFrames({});
    }
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
    setSpeechSynthesis(window.speechSynthesis);
    return () => {
      stopCamera();
    };
  }, []);

  const getSessionDuration = () => {
    return Math.floor((Date.now() - sessionStartTime) / 1000);
  };

  const customSignsList = Object.keys(customSigns);
  const alphabetSignsList = Object.keys(alphabetSigns);

  return (
    <div className="sign-to-speech-container">
      <header className="header">
        <div className="header-content">
          <button 
            onClick={() => navigate('/')}
            className="back-button"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          
          {/* <h1 className="title">Sign Language to Speech Interpreter</h1> */}
        </div>
      </header>

      <div className="main-content">
        <div className="camera-section">
          <div className="camera-container">
            <video
              ref={videoRef}
              className="camera-video"
              style={{ transform: 'scaleX(-1)' }}
              autoPlay
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="camera-canvas"
              style={{ transform: 'scaleX(-1)' }}
              width={640}
              height={480}
            />
            <div className="camera-overlay">
              <div className="camera-status">
                <CameraIcon size={16} />
                {isCameraActive ? 'Live' : 'Offline'}
              </div>
            </div>
          </div>

          <div className="detection-display">
            {currentSign ? (
              <div className="detection-content">
                <div className="detection-text">{currentSign}</div>
                {detectionFrames[currentSign] && (
                  <div className="confidence-container">
                    <div className="confidence-label">Confidence</div>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill" 
                        style={{ width: `${Math.min((detectionFrames[currentSign] / confidenceThreshold) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="stability-indicator">
                      {gestureStartTime && (Date.now() - gestureStartTime) >= 600 ? (
                        <span className="ready-to-speak">Ready to Speak!</span>
                      ) : gestureStartTime ? (
                        <span className="building-stability">
                          Hold steady... ({Math.max(0, Math.ceil((600 - (Date.now() - gestureStartTime)) / 100))}s)
                        </span>
                      ) : (
                        <span className="detecting">Detecting...</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-detection">No sign detected</div>
            )}
          </div>
        </div>

        <div className="controls-section">
          <div className="control-panel">
            <div className="panel-title">
              <CameraIcon />
              Camera Controls
            </div>
            <div className="control-buttons">
              {!isCameraActive ? (
                <button 
                  className="control-button primary"
                  onClick={startCamera}
                  disabled={isLoading}
                >
                  <Play size={20} />
                  Start Camera
                </button>
              ) : (
                <button 
                  className="control-button danger"
                  onClick={stopCamera}
                >
                  <Square size={20} />
                  Stop Camera
                </button>
              )}
            </div>
          </div>


          <div className="control-panel">
            <div className="panel-title">
              <BarChart3 />
              Session Stats
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{detectionCount}</div>
                <div className="stat-label">Total Signs</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{getSessionDuration()}s</div>
                <div className="stat-label">Session Time</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{customSignsList.length}</div>
                <div className="stat-label">Custom Signs</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{alphabetSignsList.length}</div>
                <div className="stat-label">Alphabet Signs</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignToSpeech;