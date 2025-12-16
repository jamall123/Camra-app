import { useState, useCallback } from 'react';
import { Scene } from './components/Scene';
import { HolisticTracker } from './components/HolisticTracker';
import { AvatarGallery } from './components/AvatarGallery';
import { WelcomeMessage } from './components/WelcomeMessage';
import { Recorder } from './components/Recorder';
import { BACKGROUNDS } from './data';

function App() {
  const [currentBg, setCurrentBg] = useState(BACKGROUNDS[0]);
  const [riggedPose, setRiggedPose] = useState<any>(null);
  const [showInput, setShowInput] = useState(false);

  // State for Tracking Status
  const [trackingStatus, setTrackingStatus] = useState({ face: false, pose: false, hands: false });

  // Default Avatar
  const [modelUrl, setModelUrl] = useState("https://models.readyplayer.me/693fd189fe6f676b663eef96.glb");
  const [inputUrl, setInputUrl] = useState(modelUrl);

  const handlePoseUpdate = useCallback((pose: any) => {
    setRiggedPose(pose);
  }, []);

  const handleTrackingUpdate = useCallback((status: { face: boolean; pose: boolean; hands: boolean }) => {
    setTrackingStatus(status);
  }, []);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setModelUrl(inputUrl);
      setShowInput(false);
    }
  };

  const handleSelectAvatar = (url: string) => {
    setModelUrl(url);
    setInputUrl(url);
  };

  return (
    <main>
      <div className="canvas-container">
        <Scene
          background={currentBg.color}
          riggedPose={riggedPose}
          modelUrl={modelUrl}
        />
      </div>

      {!modelUrl && <WelcomeMessage />}

      {/* Logic Components */}
      <HolisticTracker
        onPoseUpdate={handlePoseUpdate}
        onTrackingStatus={handleTrackingUpdate}
      />

      {/* --- Visual Tracking Indicators --- */}
      <div className="tracking-status">
        <div className={`status-dot ${trackingStatus.face ? 'active' : ''}`} title="Face Detected">😐</div>
        <div className={`status-dot ${trackingStatus.hands ? 'active' : ''}`} title="Hands Detected">✋</div>
        <div className={`status-dot ${trackingStatus.pose ? 'active' : ''}`} title="Body Detected">🕺</div>
      </div>

      <Recorder />

      <AvatarGallery
        onSelectAvatar={handleSelectAvatar}
        currentAvatarUrl={modelUrl}
      />

      {/* --- UI CONTROLS --- */}

      {/* 1. Custom Link Button */}
      <button
        className="icon-button link-button"
        onClick={() => setShowInput(!showInput)}
        title="Load Custom GLB URL"
      >
        🔗
      </button>

      {/* 2. Collapsible URL Input */}
      <div className={`model-url-input ${showInput ? 'visible' : ''}`}>
        <form onSubmit={handleUrlSubmit}>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste RPM GLB URL..."
          />
          <button type="submit">Go</button>
          <button type="button" className="close-btn" onClick={() => setShowInput(false)}>×</button>
        </form>
      </div>

      {/* 3. Background Switcher */}
      <div className="ui-overlay">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.id}
            className={`ui-button ${currentBg.id === bg.id ? 'active' : ''}`}
            onClick={() => setCurrentBg(bg)}
            style={{ backgroundColor: bg.color }}
            title={bg.name}
          />
        ))}
      </div>
    </main>
  );
}

export default App;

