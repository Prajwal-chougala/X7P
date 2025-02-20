import { useState } from 'react';
import AdsComponent from './components/AdsComponent';
import CameraFlow from './components/CameraFlow';
import v1 from './ads/video1.mp4'
import v2 from './ads/video2.mp4'

function App() {
  const [showCamera, setShowCamera] = useState(false);
  const [adsVideo] = useState(v2);

  return (
    <div className="app-container">
      {!showCamera ? (
        <AdsComponent videoSrc={adsVideo} onGoClick={() => setShowCamera(true)} />
      ) : (
        <CameraFlow onComplete={() => setShowCamera(false)} />
      )}
    </div>
  );
}

export default App;