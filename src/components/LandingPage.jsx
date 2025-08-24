import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HandHeart, Mic, ArrowRight, Sparkles } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleSignToSpeech = () => {
    navigate('/signtospeech');
  };

  const handleSpeechToSign = () => {
    navigate('/speechtosign');
  };

  return (
    <div className="landing-page">
      {/* Background Pattern */}
      <div className="background-pattern"></div>
      
      <div className="landing-content">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="header-flex">
              <div className="logo-container">
                <div className="logo-icon">
                  <HandHeart />
                </div>
                <h1 className="logo-text">
                  Deafy
                </h1>
              </div>
              <div className="header-info">
                <span>Advanced Sign Language Platform</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div className="main-container">
            {/* Hero Section */}
            <div className="hero-section">
              <div className="badge">
                <Sparkles />
                <span>Empowering Communication</span>
              </div>
              
              <h2 className="hero-title">
                Bridge the Gap with
                <span>Sign Language</span>
              </h2>
              
              <p className="hero-description">
                Transform communication barriers into bridges. Our advanced platform helps you learn, 
                practice, and master sign language with cutting-edge technology.
              </p>
            </div>

            {/* Features Grid */}
            <div className="features-grid">
              {/* Sign to Speech Card */}
              <div 
                onClick={handleSignToSpeech}
                className="feature-card sign-to-speech"
              >
                <div className="card-background"></div>
                
                <div className="card-content">
                  <div className="card-icon sign-to-speech">
                    <HandHeart />
                  </div>
                  
                  <h3 className="card-title">
                    Sign to Speech
                  </h3>
                  
                  <p className="card-description">
                    Convert hand gestures and sign language to spoken words in real-time using advanced 
                    computer vision and machine learning.
                  </p>
                  
                  <ul className="features-list">
                    <li>Real-time hand detection</li>
                    <li>46 different signs supported</li>
                    <li>Instant text-to-speech output</li>
                    <li>Professional sign recognition</li>
                  </ul>
                  
                  <div className="card-actions">
                    <button className="card-button">
                      Start Detection
                    </button>
                    <ArrowRight className="card-arrow" />
                  </div>
                </div>
              </div>

              {/* Speech to Sign Card */}
              <div 
                onClick={handleSpeechToSign}
                className="feature-card speech-to-sign"
              >
                <div className="card-background"></div>
                
                <div className="card-content">
                  <div className="card-icon speech-to-sign">
                    <Mic />
                  </div>
                  
                  <h3 className="card-title">
                    Speech to Sign
                  </h3>
                  
                  <p className="card-description">
                    Convert spoken words to sign language animations and visual guides for interactive 
                    learning and communication.
                  </p>
                  
                  <ul className="features-list">
                    <li>Voice recognition</li>
                    <li>Sign language animations</li>
                    <li>Visual learning guides</li>
                    <li>Pronunciation assistance</li>
                  </ul>
                  
                  <div className="card-actions">
                    <button className="card-button">
                      Start Recognition
                    </button>
                    <ArrowRight className="card-arrow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p className="footer-text">
              Empowering communication through technology • Making sign language accessible to everyone
            </p>
            <div className="footer-stats">
              <div className="stat-item">
                <div className="stat-dot"></div>
                <span className="stat-text">Real-time Processing</span>
              </div>
              <div className="stat-item">
                <div className="stat-dot"></div>
                <span className="stat-text">AI-Powered</span>
              </div>
              <div className="stat-item">
                <div className="stat-dot"></div>
                <span className="stat-text">Accessible</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
