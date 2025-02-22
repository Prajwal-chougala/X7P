import { useEffect, useRef, useState } from "react";

export default function AdsComponent({ videoSrc, onGoClick, onVideoEnd }) {
  const mainVideoRef = useRef(null);
  const preloadedVideoRef = useRef(null);
  const [nextVideoSrc, setNextVideoSrc] = useState(null);

  // Preload the next video when `videoSrc` changes
  useEffect(() => {
    if (videoSrc) {
      setNextVideoSrc(videoSrc); // Set the next video source
    }
  }, [videoSrc]);

  // Handle video end event
  useEffect(() => {
    const handleVideoEnd = () => {
      onVideoEnd(); // Notify parent to switch video
    };

    const videoElement = mainVideoRef.current;
    videoElement.addEventListener("ended", handleVideoEnd);

    return () => {
      videoElement.removeEventListener("ended", handleVideoEnd);
    };
  }, [onVideoEnd]);

  // Preload the next video when `nextVideoSrc` changes
  useEffect(() => {
    if (preloadedVideoRef.current && nextVideoSrc) {
      preloadedVideoRef.current.src = nextVideoSrc; // Set the source for preloading
      preloadedVideoRef.current.load(); // Force the browser to load it in memory
    }
  }, [nextVideoSrc]);

  return (
    <div className="ads-container">
      {/* Main Video */}
      <video
        ref={mainVideoRef}
        key={videoSrc}
        src={videoSrc}
        autoPlay
        muted
        loop={false}
      />

      {/* Preloaded Hidden Video */}
      <video
        ref={preloadedVideoRef}
        src={nextVideoSrc}
        preload="none"
        style={{ display: "none" }} // Keep it hidden
      />

      <footer className="footer">
        <button className="go-button" onClick={onGoClick}>
          GO
        </button>
      </footer>
    </div>
  );
}