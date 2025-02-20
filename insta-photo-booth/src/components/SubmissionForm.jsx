import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SubmissionForm({ finalImage, onComplete }) {
  const [formData, setFormData] = useState({
    mobile: '',
    instagram: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
    <form onSubmit={handleSubmit}>
      <input
        type="tel"
        placeholder="Mobile Number"
        required
        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
      />
      <input
        type="text"
        placeholder="Instagram Handle"
        required
        onChange={(e) => setFormData({...formData, instagram: e.target.value})}
      />
      <button type="submit">Submit</button>
    </form>
  );
}