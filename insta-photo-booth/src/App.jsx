import { useState } from "react";
import AdsComponent from "./components/AdsComponent";
import CameraFlow from "./components/CameraFlow";
import v1 from "./ads/video1.mp4";
import v2 from "./ads/video2.mp4";
<<<<<<< HEAD
import logo from "./ads/amul-logo.png";

=======
import logo from "./ads/amul-logo.png"; 
>>>>>>> upstream/main

function App() {
  const [showCamera, setShowCamera] = useState(false);
  const [adsVideos] = useState([v1, v2]); // Store both videos
  const [currentIndex, setCurrentIndex] = useState(0); // Start with the first video

  const handleVideoEnd = () => {
    setCurrentIndex((currentIndex) => (currentIndex + 1) % adsVideos.length);
  };

  return (
    <div className="app-container">
        <img
        src={logo}
        alt="Logo"
        className="logo"
      />
      {!showCamera ? (
        <AdsComponent
          videoSrc={adsVideos[currentIndex]}
          onGoClick={() => setShowCamera(true)}
          onVideoEnd={handleVideoEnd} // Pass video end event
        />
      ) : (
        <CameraFlow onComplete={() => setShowCamera(false)} />
      )}
    </div>
  );
}

export default App;