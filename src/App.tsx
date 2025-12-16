import { useState, useCallback } from 'react';
import { Scene } from './components/Scene';
import { HolisticTracker } from './components/HolisticTracker';
import { AvatarGallery } from './components/AvatarGallery';
import { Recorder } from './components/Recorder';
import { BackgroundPicker } from './components/BackgroundPicker';
import { BACKGROUNDS } from './data';
import type { TrackingStatus, Background, AppMode } from './types';

import './App.css';

function App() {
  // State
  const [currentBg, setCurrentBg] = useState<Background>(BACKGROUNDS[0]);
  const [riggedPose, setRiggedPose] = useState<any>(null);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>({
    face: false,
    pose: false,
    hands: false,
  });
  const [mode, setMode] = useState<AppMode>('camera');
  const [modelUrl, setModelUrl] = useState(
    'https://models.readyplayer.me/693fd189fe6f676b663eef96.glb'
  );
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [inputUrl, setInputUrl] = useState(modelUrl);

  // Handlers
  const handlePoseUpdate = useCallback((pose: any) => {
    setRiggedPose(pose);
  }, []);

  const handleTrackingUpdate = useCallback((status: TrackingStatus) => {
    setTrackingStatus(status);
  }, []);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setModelUrl(inputUrl.trim());
      setShowUrlInput(false);
    }
  };

  const handleSelectAvatar = (url: string) => {
    setModelUrl(url);
    setInputUrl(url);
  };

  const handleBackgroundChange = (bg: Background) => {
    setCurrentBg(bg);
  };

  return (
    <main className="app-container">
      {/* 3D Scene */}
      <div className="canvas-container">
        <Scene background={currentBg} riggedPose={riggedPose} modelUrl={modelUrl} />
      </div>

      {/* Tracking Component */}
      <HolisticTracker
        onPoseUpdate={handlePoseUpdate}
        onTrackingStatus={handleTrackingUpdate}
        mode={mode}
      />

      {/* Tracking Status Indicators */}
      <div className="tracking-status">
        <div
          className={`status-dot ${trackingStatus.face ? 'active' : ''}`}
          title="Face Detected"
        >
          😐
        </div>
        <div
          className={`status-dot ${trackingStatus.hands ? 'active' : ''}`}
          title="Hands Detected"
        >
          ✋
        </div>
        <div
          className={`status-dot ${trackingStatus.pose ? 'active' : ''}`}
          title="Body Detected"
        >
          🕺
        </div>
      </div>

      {/* Mode Toggle (Camera / Video) */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'camera' ? 'active' : ''}`}
          onClick={() => setMode('camera')}
          title="استخدام الكاميرا"
        >
          📷 كاميرا
        </button>
        <button
          className={`mode-btn ${mode === 'video' ? 'active' : ''}`}
          onClick={() => setMode('video')}
          title="رفع فيديو"
        >
          📁 فيديو
        </button>
      </div>

      {/* Recording Controls */}
      <Recorder />

      {/* Avatar Gallery */}
      <AvatarGallery onSelectAvatar={handleSelectAvatar} currentAvatarUrl={modelUrl} />

      {/* Background Picker */}
      <BackgroundPicker
        currentBackground={currentBg}
        onBackgroundChange={handleBackgroundChange}
      />

      {/* Custom URL Input Button */}
      <button
        className="icon-button link-button"
        onClick={() => setShowUrlInput(!showUrlInput)}
        title="تحميل رابط GLB مخصص"
      >
        🔗
      </button>

      {/* URL Input Form */}
      <div className={`model-url-input ${showUrlInput ? 'visible' : ''}`}>
        <form onSubmit={handleUrlSubmit}>
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="الصق رابط GLB هنا..."
          />
          <button type="submit">تحميل</button>
          <button
            type="button"
            className="close-btn"
            onClick={() => setShowUrlInput(false)}
          >
            ✕
          </button>
        </form>
      </div>
    </main>
  );
}

export default App;
