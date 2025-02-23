import { useEffect, useState } from 'react';
import axios from 'axios';
import './BackgroundSelector.css';
import SubmissionForm from './SubmissionForm';

export default function BackgroundSelector({ image, filters, onSelect }) {
  const [step, setStep] = useState(1); // 1: Select filter, 2: Show result, 3: Show form
  const [loading, setLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function removeBackground() {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }

    removeBackground();
  }, [image]);

  return (
    <div className="bg-selector">
      {step === 1 && (
        <div className="filter-selection">
          <h2>Select a Filter</h2>
          <div className="bg-options">
            {filters.map((bg, index) => (
              <div 
                key={index}
                className={`bg-option ${selectedBackground === bg ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedBackground(bg);
                  setStep(2);
                }}
                style={{ backgroundImage: `url(${bg})` }}
              />
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <>
          {loading && <div className="loading-overlay">Processing image...</div>}
          {processedImage && (
            <div className="result-container">
              <div className="image-wrapper" style={{ 
                backgroundImage: selectedBackground ? `url(${selectedBackground})` : 'none'
              }}>
                <img src={processedImage} alt="processed" />
              </div>
              
              <div className="action-buttons">
                <button 
                  className="back-button"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button 
                  className="next-button"
                  onClick={() => setStep(3)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {step === 3 && (
        <SubmissionForm 
          finalImage={combineImages(processedImage, selectedBackground)}
          onComplete={onSelect}
        />
      )}
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
