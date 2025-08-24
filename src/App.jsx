import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import SignToSpeech from './components/SignToSpeech';
import SpeechToSign from './components/SpeechToSign';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />}  />
          <Route path="/signtospeech" element={<SignToSpeech />} />
          <Route path="/speechtosign" element={<SpeechToSign />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
