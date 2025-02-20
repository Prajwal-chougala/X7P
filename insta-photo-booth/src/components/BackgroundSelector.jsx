import { useEffect, useState } from 'react';
import axios from 'axios';
import './BackgroundSelector.css';

const brandBackgrounds = [
  './ads/icon.jpj',
  'bg2.jpg',
  'bg3.jpg',
];

export default function BackgroundSelector({ image, onSelect }) {
    const [processedImage, setProcessedImage] = useState(null);
    const [selectedBackground, setSelectedBackground] = useState(null);
    const [error, setError] = useState(null);



    useEffect(() => {
      async function removeBackground() {
        try {
          const base64Data = image.split(',')[1];
  
          const response = await axios.post(
            'https://api.remove.bg/v1.0/removebg',
            {
              image_file_b64: base64Data,
              size: 'auto',
              format: 'png'
            },
            {
              headers: { 
                'X-Api-Key': 'jWo9JUN75st3bq1CGDHUGs3F',
                'Content-Type': 'application/json'
              },
              responseType: 'arraybuffer'
            }
          );
  
          const base64 = btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );
          setProcessedImage(`data:image/png;base64,${base64}`);
          setError(null);
        } catch (error) {
          console.error('Background removal failed:', error);
          setError('Background removal failed - using original image');
          setProcessedImage(image); // Fallback to original image
        }
      }
  
      removeBackground();
    }, [image]);
  const handleBackgroundSelect = (bg) => {
    setSelectedBackground(bg);
    // Combine processed image with selected background
    const finalImage = combineImages(processedImage, bg);
    onSelect(finalImage);
  };

  return (
    <div className="bg-selector">
      <div className="preview-container">
        {processedImage && (
          <div className="image-wrapper" style={{ 
            backgroundImage: selectedBackground ? `url(${selectedBackground})` : 'none'
          }}>
            <img src={processedImage} alt="processed" />
          </div>
        )}
      </div>
      
      <div className="bg-options">
        {brandBackgrounds.map((bg, index) => (
          <div 
            key={index}
            className={`bg-option ${selectedBackground === bg ? 'selected' : ''}`}
            onClick={() => handleBackgroundSelect(bg)}
            style={{ backgroundImage: `url(${bg})` }}
          />
        ))}
      </div>
      
      <button 
        className="confirm-button"
        onClick={() => onSelect(combineImages(processedImage, selectedBackground))}
        disabled={!selectedBackground}
      >
        Confirm Selection
      </button>
    </div>
  );
}

// Helper function to combine images (pseudo-implementation)
const combineImages = (foreground, background) => {
  // You'll need to implement actual image combining logic using:
  // - HTML Canvas
  // - A library like fabric.js
  // - Server-side processing
  return `${background}|${foreground}`; // Temporary implementation
};
