import { ChevronRight, FastForward, Pause, Play, Rewind, RotateCcw, Mic, MicOff, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './SpeechToSign.css';

export default function AudioToSign() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [currentLetter, setCurrentLetter] = useState('');
  const [playMode, setPlayMode] = useState('');
  const [highlightedText, setHighlightedText] = useState([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef(null);
  const videoQueueRef = useRef([]);
  const preloadedVideosRef = useRef(new Map());
  const wordsRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  const videoBasePath = '/animated_videos/';

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullText = finalTranscript || interimTranscript;
        if (fullText.trim()) {
          setRecordedText(fullText.trim());
          updateHighlightedText(fullText.trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setIsProcessing(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setIsProcessing(false);
      };
    }
  }, []);

  // Update highlighted text when recorded text changes
  const updateHighlightedText = (text) => {
    const words = text.split(/\s+/).map(word => ({
      text: word,
      isHighlighted: false
    }));
    setHighlightedText(words);
    wordsRef.current = text.split(/\s+/);
  };

  // Preload common videos
  useEffect(() => {
    // Preload alphabet videos
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (const letter of alphabet) {
      preloadVideo(`${videoBasePath}${letter}.mp4`);
    }
    
    // Preload number videos
    for (let i = 0; i <= 9; i++) {
      preloadVideo(`${videoBasePath}${i}.mp4`);
    }
  }, []);

  // Effect to update video playback rate when speed changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Recording timer effect
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  const preloadVideo = (src) => {
    if (!preloadedVideosRef.current.has(src)) {
      const video = document.createElement('video');
      video.src = src;
      video.preload = 'auto';
      video.load();
      preloadedVideosRef.current.set(src, video);
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setIsProcessing(false);
      setRecordedText('');
      setHighlightedText([]);
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Get microphone access for audio level monitoring
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context for level monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Monitor audio level
      const updateAudioLevel = () => {
        if (isRecording && analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setAudioLevel(average / 255);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setAudioLevel(0);
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  const clearRecording = () => {
    setRecordedText('');
    setHighlightedText([]);
    wordsRef.current = [];
    stopPlayback();
  };

  const startPlayback = () => {
    if (!recordedText.trim()) {
      alert('Please record some audio first!');
      return;
    }
    
    if (isPlaying && !isPaused) return;
    
    if (isPaused) {
      // Resume from paused state
      setIsPaused(false);
      if (videoRef.current) {
        videoRef.current.play();
      }
      return;
    }
    
    // Start from beginning or current position
    setIsPlaying(true);
    setIsPaused(false);
    
    // Reset highlighting if starting from beginning
    if (currentWordIndex === 0) {
      setHighlightedText(prevText => 
        prevText.map(word => ({ ...word, isHighlighted: false }))
      );
    }
    
    processSentence(wordsRef.current, currentWordIndex);
  };

  const processSentence = (words, startIndex = 0) => {
    // Start playing the sequence
    playNextWord(words, startIndex);
  };

  const playNextWord = (words, index) => {
    if (index >= words.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWord('');
      setCurrentLetter('');
      setPlayMode('');
      setCurrentWordIndex(0);
      
      // Reset all highlighting when finished
      setHighlightedText(prevText => 
        prevText.map(word => ({ ...word, isHighlighted: false }))
      );
      return;
    }

    // Store current index for pause/resume
    setCurrentWordIndex(index);

    const word = words[index];
    if (!word) {
      playNextWord(words, index + 1);
      return;
    }
    
    // Filter out special characters
    const filteredWord = word.replace(/[^a-zA-Z0-9]/g, '');
    if (!filteredWord) {
      playNextWord(words, index + 1);
      return;
    }

    // Highlight the current word
    setHighlightedText(prevText => {
      const newText = [...prevText];
      // Reset previous highlights
      newText.forEach((item, i) => {
        newText[i] = { ...item, isHighlighted: false };
      });
      // Set new highlight
      return newText.map((item, i) => {
        if (i === index) {
          return { ...item, isHighlighted: true };
        }
        return item;
      });
    });

    setCurrentWord(filteredWord);
    setIsPlaying(true);

    const capitalizedWord = filteredWord.charAt(0).toUpperCase() + filteredWord.slice(1).toLowerCase();
    const wordVideoPath = `${videoBasePath}${capitalizedWord}.mp4`;

    setPlayMode('word');
    
    // Queue up the entire sequence of videos
    videoQueueRef.current = [];
    
    // First add the word video
    videoQueueRef.current.push({
      src: wordVideoPath,
      onError: () => {
        // If word video fails, queue all letter/number videos
        for (let i = 0; i < filteredWord.length; i++) {
          const char = filteredWord[i];
          let videoPath = null;
          
          if (/^[A-Za-z]$/.test(char)) {
            videoPath = `${videoBasePath}${char.toUpperCase()}.mp4`;
          } else if (/^[0-9]$/.test(char)) {
            videoPath = `${videoBasePath}${char}.mp4`;
          }
          
          if (videoPath) {
            videoQueueRef.current.push({
              src: videoPath,
              onStart: () => {
                setPlayMode('letter');
                setCurrentLetter(char.toUpperCase());
              },
              onError: null
            });
          }
        }
      }
    });
    
    // Start playing the queue
    playNextInQueue(() => {
      // Short delay before moving to next word for better user experience
      const delayTime = 300 / playbackSpeed;
      setTimeout(() => {
        if (!isPaused) {
          playNextWord(words, index + 1);
        }
      }, delayTime);
    });
  };

  const playNextInQueue = (onComplete) => {
    if (videoQueueRef.current.length === 0 || isPaused) {
      onComplete();
      return;
    }
    
    const nextVideo = videoQueueRef.current.shift();
    const video = videoRef.current;
    
    if (!video) {
      if (videoQueueRef.current.length > 0) {
        playNextInQueue(onComplete);
      } else {
        onComplete();
      }
      return;
    }
    
    // Clean up previous event handlers
    video.onended = null;
    video.onerror = null;
    video.oncanplay = null;
    
    // If we have a preloaded video, use its src
    const preloadedVideo = preloadedVideosRef.current.get(nextVideo.src);
    if (preloadedVideo) {
      video.src = preloadedVideo.src;
    } else {
      video.src = nextVideo.src;
    }
    
    // Set playback speed
    video.playbackRate = playbackSpeed;
    
    // Use requestAnimationFrame to optimize video loading
    requestAnimationFrame(() => {
      video.load();
      
      video.oncanplay = () => {
        if (nextVideo.onStart) nextVideo.onStart();
        
        if (isPaused) {
          onComplete();
          return;
        }
        
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`Playing: ${nextVideo.src}`);
            })
            .catch((error) => {
              console.error(`Play error: ${error}`);
              if (nextVideo.onError) {
                nextVideo.onError();
                playNextInQueue(onComplete);
              } else if (videoQueueRef.current.length > 0) {
                playNextInQueue(onComplete);
              } else {
                onComplete();
              }
            });
        }
      };
      
      video.onended = () => {
        if (videoQueueRef.current.length > 0) {
          requestAnimationFrame(() => {
            setTimeout(() => playNextInQueue(onComplete), 0);
          });
        } else {
          onComplete();
        }
      };
      
      video.onerror = () => {
        console.error(`Error loading/playing video: ${nextVideo.src}`);
        if (nextVideo.onError) {
          nextVideo.onError();
          requestAnimationFrame(() => {
            setTimeout(() => playNextInQueue(onComplete), 0);
          });
        } else if (videoQueueRef.current.length > 0) {
          requestAnimationFrame(() => {
            setTimeout(() => playNextInQueue(onComplete), 0);
          });
        } else {
          onComplete();
        }
      };
    });
  };

  const pausePlayback = () => {
    if (!isPlaying || isPaused) return;
    
    setIsPaused(true);
    
    // Pause the video
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const stopPlayback = () => {
    if (!isPlaying && !isPaused) return;
    
    // Clear the queue
    videoQueueRef.current = [];
    
    // Stop the video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    
    // Reset states
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWord('');
    setCurrentLetter('');
    setPlayMode('');
    setCurrentWordIndex(0);
    
    // Reset all highlighting
    setHighlightedText(prevText => 
      prevText.map(word => ({ ...word, isHighlighted: false }))
    );
  };

  const restartPlayback = () => {
    // Stop and reset everything
    stopPlayback();
    
    // Start from the beginning after a short delay
    setTimeout(() => {
      setCurrentWordIndex(0);
      startPlayback();
    }, 100);
  };

  const setSpeed = (speed) => {
    setPlaybackSpeed(speed);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="speech-to-sign-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <button 
            onClick={() => window.history.back()}
            className="back-button"
          >
            <ChevronRight size={20} />
            Back to Home
          </button>
          
          <h1 className="title">Audio to Sign Language Converter</h1>
        </div>
      </header>
      
      <div className="main-content">
        {/* Left column - Audio Recording */}
        <div className="text-section">
          <div className="text-panel">
            <h2 className="panel-title">
              <Volume2 size={20} />
              Audio to Sign
            </h2>
            
            {/* Recording Controls */}
            <div className="recording-controls">
              <div className="control-buttons">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="control-button success"
                    disabled={isProcessing}
                  >
                    <Mic size={20} />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="control-button danger recording-active"
                  >
                    <MicOff size={20} />
                    Stop Recording
                  </button>
                )}
                
                {recordedText && (
                  <button
                    onClick={clearRecording}
                    className="control-button secondary"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {/* Recording Status */}
              {isRecording && (
                <div className="recording-status">
                  <div className="recording-info">
                    <span className="recording-time">Recording... {formatTime(recordingTime)}</span>
                    <div className="audio-level-container">
                      <div 
                        className="audio-level-bar"
                        style={{ width: `${audioLevel * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="recording-instruction">Speak clearly into your microphone</p>
                </div>
              )}
              
              {isProcessing && (
                <div className="processing-status">
                  <p className="processing-text">Processing audio...</p>
                </div>
              )}
            </div>
            
            {/* Transcribed Text Display */}
            <div className="text-content">
              <h3 className="transcription-title">Transcribed Text:</h3>
              {recordedText ? (
                <div className="transcribed-content">
                  {highlightedText.map((word, index) => (
                    <span 
                      key={index} 
                      className={`highlighted-text ${
                        word.isHighlighted ? 'active' : 'inactive'
                      }`}
                    >
                      {word.text}{' '}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="placeholder-text">
                  {isRecording ? 'Listening...' : 'Click "Start Recording" to begin recording audio'}
                </p>
              )}
            </div>
            
            {/* Browser Support Warning */}
            {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
              <div className="browser-warning">
                <p className="warning-text">
                  Speech recognition not supported in this browser. Please use Chrome or Edge for best experience.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Video player */}
        <div className="video-section">
          <div className="video-panel">
            <div className="video-container">
              <video 
                ref={videoRef}
                className="video-player"
                controls={false}
                playsInline
                muted={false}
              />
            </div>
            
            {/* Caption Display */}
            {isPlaying && (
              <div className="caption-display">
                <div className={`caption-content ${isPaused ? 'paused' : 'playing'}`}>
                  {playMode === 'word' ? (
                    <div className="caption-text">
                      <span className="caption-label">Signing:</span>
                      <span className="caption-value">{currentWord}</span>
                    </div>
                  ) : (
                    <div className="caption-text">
                      <span className="caption-label">Signing character:</span>
                      <span className="caption-value">{currentLetter}</span>
                      <span className="caption-context">from "{currentWord}"</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Player controls */}
            <div className="video-controls">
              <div className="controls-row">
                {/* Play/Pause Button */}
                {(!isPlaying || isPaused) ? (
                  <button 
                    onClick={startPlayback}
                    className="control-button success"
                  >
                    <Play size={20} /> {isPaused ? 'Resume' : 'Start'}
                  </button>
                ) : (
                  <button 
                    onClick={pausePlayback}
                    className="control-button warning"
                  >
                    <Pause size={20} /> Pause
                  </button>
                )}
                
                {/* Stop Button */}
                <button 
                  onClick={stopPlayback}
                  disabled={!isPlaying && !isPaused}
                  className={`control-button ${(!isPlaying && !isPaused) ? 'secondary disabled' : 'danger'}`}
                >
                  <Rewind size={20} /> Stop
                </button>
                
                {/* Restart Button */}
                <button 
                  onClick={restartPlayback}
                  className="control-button primary"
                >
                  <RotateCcw size={20} /> Restart
                </button>
              </div>
              
              {/* Speed controls */}
              <div className="speed-controls">
                <span className="speed-label">
                  <FastForward size={16} /> Speed:
                </span>
                <div className="speed-buttons">
                  {[0.5, 1, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setSpeed(speed)}
                      className={`speed-button ${playbackSpeed === speed ? 'active' : 'inactive'}`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Status bar */}
            <div className="status-bar">
              <div className="status-text">
                {isPlaying ? (
                  isPaused ? "Paused - Click Resume to continue" : "Playing..." 
                ) : recordedText ? (
                  "Ready to start - Click Start to begin"
                ) : (
                  "Record some audio first to convert to sign language"
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}