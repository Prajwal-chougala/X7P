import { useState, useRef, useEffect } from 'react';
import BackgroundSelector from './BackgroundSelector';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import './CameraFlow.css';
import image1 from '../ads/image1.jpeg';
import image2 from '../ads/image2.png';
import image3 from '../ads/image3.png';
import image4 from '../ads/image4.webp';




const CameraFlow = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [capturedImage, setCapturedImage] = useState(null);
  const [timer, setTimer] = useState(null);
  const webcamRef = useRef(null);
  const modelRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(true);

  // Load models
  useEffect(() => {
    async function loadModels() {
      const [mobilenetModel, cocoSsdModel] = await Promise.all([
        mobilenet.load({ version: 2, alpha: 1.0 }),
        cocoSsd.load()
      ]);
      modelRef.current = { mobilenet: mobilenetModel, cocoSsd: cocoSsdModel };
    }
    loadModels();
  }, []);

  const isHuman = async (imageSrc) => {
    const img = new Image();
    img.src = imageSrc;
    
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    // Use COCO-SSD for object detection
    const cocoPredictions = await modelRef.current.cocoSsd.detect(img);
    
    // Check if any detected object is a person
    const personDetected = cocoPredictions.some(
      pred => pred.class === 'person' && pred.score > 0.7
    );

    if (personDetected) return true;

    // Fallback to MobileNet classification
    const tensor = tf.browser.fromPixels(img)
      .resizeBilinear([224, 224])
      .toFloat()
      .div(tf.scalar(255))
      .expandDims();

    const mobilenetPredictions = await modelRef.current.mobilenet.classify(tensor);
    tensor.dispose();

    // Human-related classes
    const humanClasses = ['person', 'human', 'man', 'woman', 'child', 'boy', 'girl'];
    const confidenceThreshold = 0.7;

    return mobilenetPredictions.some(pred => 
      humanClasses.some(c => 
        pred.className.toLowerCase().includes(c) && 
        pred.probability > confidenceThreshold
      )
    );
  };

  const capturePhoto = async () => {
    if (!modelRef.current) {
      alert('Verifying Human or Not...please wait...');
      return;
    }

    setTimer(3);
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      
      // Verify human presence
      const humanDetected = await isHuman(imageSrc);
      
      if (!humanDetected) {
        clearInterval(countdown);
        setTimer(null);
        alert('No human detected!');
        return;
      }
      else{
      alert("Human verification Completed");
      }

      setTimeout(() => {
        clearInterval(countdown);
        setCapturedImage(imageSrc);
        setStep(2);
        setTimer(null);
      }, 3000);

    } catch (error) {
      console.error('Detection failed:', error);
      clearInterval(countdown);
      setTimer(null);
    };
   
  };
   const videoStyle = {
      transform: isFlipped ? "scaleX(-1)" : "scaleX(1)", // Flip horizontally
      // width: "100%",
      // height: "auto",
    };

  return (
    <div className="camera-flow">
      {step === 1 && (
        <div className="camera-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={videoStyle}
            onDragStart={() => setIsFlipped(isFlipped)}
          />
          
          <button 
            className="shutter-button" 
            onClick={capturePhoto}
            disabled={timer !== null}
          >
            <div className="shutter-circle">
              {timer > 0 && <span className="countdown">{timer}</span>}
            </div>
            Capture
          </button>
        </div>
      )}
      
      {step === 2 && (
        <BackgroundSelector 
          image={capturedImage}
          filters={[image1, image2, image3, image4]}
          onSelect={(bg) => {
            setSelectedBg(bg);
            setStep(3);
          }}
        />

      )}
                                                                                                     
      {step === 3 && (
        <SubmissionForm 
          finalImage={`${capturedImage}|${selectedBg}`} 
          onComplete={onComplete}
        />
      )}
    </div>
  );
};

export default CameraFlow;
