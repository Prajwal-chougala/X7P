import { useState } from 'react';
import axios from 'axios';
import './SubmissionForm.css';

export default function SubmissionForm({ finalImage, onComplete }) {
  const [formData, setFormData] = useState({
    mobile: '',
    instagram: ''
  });
  const [errors, setErrors] = useState({
    mobile: '',
    instagram: ''
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = { mobile: '', instagram: '' };

    // Mobile number validation
    if (!formData.mobile.match(/^\d{10}$/)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
      valid = false;
    }

    // Instagram handle validation
    if (!formData.instagram.match(/^@?[a-zA-Z0-9._]{1,30}$/)) {
      newErrors.instagram = 'Please enter a valid Instagram handle';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Send to backend
      await axios.post('/api/submit', {
        ...formData,
        image: finalImage
      });

      // Check Instagram story (mock implementation)
      const storyPosted = await checkInstagramStory(formData.instagram);
      
      if(storyPosted) {
        await sendCoupon(formData.mobile);
        onComplete();
      }
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className={`form-group ${errors.mobile ? 'invalid' : ''}`}>
          <label htmlFor="mobile">Mobile Number</label>
          <input
            type="tel"
            id="mobile"
            placeholder="Enter your 10-digit mobile number"
            value={formData.mobile}
            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
          />
          <span className="error-message">{errors.mobile}</span>
        </div>

        <div className={`form-group ${errors.instagram ? 'invalid' : ''}`}>
          <label htmlFor="instagram">Instagram Handle</label>
          <input
            type="text"
            id="instagram"
            placeholder="Enter your Instagram handle"
            value={formData.instagram}
            onChange={(e) => setFormData({...formData, instagram: e.target.value})}
          />
          <span className="error-message">{errors.instagram}</span>
        </div>

        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>
    </div>
  );
}

// Mock functions for demonstration
async function checkInstagramStory(handle) {
  return new Promise(resolve => setTimeout(() => resolve(true), 1000));
}

async function sendCoupon(mobile) {
  return new Promise(resolve => setTimeout(() => resolve(), 1000));
}
