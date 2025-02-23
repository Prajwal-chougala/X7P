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
      <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#1a1a1a] p-4">
        {step === 1 && (
          <div className="relative w-full max-w-2xl mx-auto mt-8 md:mt-12 aspect-video overflow-hidden rounded-xl shadow-2xl bg-black">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className={`w-full h-full object-cover ${isFlipped ? '-scale-x-100' : ''}`}
            />
            
            <button 
              className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 
                        w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 border-2 border-white
                        transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/30
                        disabled:opacity-50 disabled:transform-none disabled:shadow-none
                        flex items-center justify-center"
              onClick={capturePhoto}
              disabled={timer !== null}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-cyan-400 rounded-lg flex items-center justify-center">
                {timer > 0 ? (
                  <span className="text-white font-bold text-xl md:text-2xl animate-pulse">
                    {timer}
                  </span>
                ) : (
                  <svg 
                    className="w-6 h-6 text-white"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                )}
              </div>
            </button>
          </div>
        )}
  
        {step === 2 && (
          <div className="w-full max-w-2xl mt-8 p-4">
            <BackgroundSelector 
              image={capturedImage}
              filters={[image1, image2, image3, image4]}
              onSelect={(bg) => {
                setSelectedBg(bg);
                setStep(3);
              }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            />
          </div>
        )}
  
        {step === 3 && (
          <div className="w-full max-w-2xl mt-8 p-4">
            <SubmissionForm 
              finalImage={`${capturedImage}|${selectedBg}`} 
              onComplete={onComplete}
              className="space-y-4"
            />
          </div>
        )}
      </div>
    );
  };
  
  export default CameraFlow;