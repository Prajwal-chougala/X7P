import { useState, useEffect } from 'react';
import axios from 'axios';
import './SubmissionForm.css';

// Instagram API Configuration
const INSTAGRAM_APP_ID = 'YOUR_INSTAGRAM_APP_ID';
const INSTAGRAM_APP_SECRET = 'YOUR_INSTAGRAM_APP_SECRET';
const REDIRECT_URI = 'YOUR_REDIRECT_URI';

export default function SubmissionForm({ finalImage, onComplete }) {
  const [formData, setFormData] = useState({
    mobile: '',
    instagram: ''
  });
  const [errors, setErrors] = useState({});
  const [instagramUser, setInstagramUser] = useState(null);
  const [mediaId, setMediaId] = useState(null);

  // Initialize Instagram OAuth
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      exchangeCodeForToken(code);
    }
  }, []);

  const exchangeCodeForToken = async (code) => {
    try {
      const response = await axios.post('https://api.instagram.com/oauth/access_token', {
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code
      });

      const { access_token, user_id } = response.data;
      setInstagramUser({ access_token, user_id });
    } catch (error) {
      console.error('Instagram authentication failed:', error);
    }
  };

  const handleInstagramAuth = () => {
    window.location.href = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media,instagram_graph_user_media&response_type=code`;
  };

  const sendInstagramDM = async () => {
    try {
      // First upload the media
      const mediaResponse = await axios.post(
        `https://graph.instagram.com/${instagramUser.user_id}/media`,
        {
          image_url: finalImage.split('|')[1],
          caption: 'Your processed photo!',
          access_token: instagramUser.access_token
        }
      );

      setMediaId(mediaResponse.data.id);
      
      // Wait for media to be processed
      const checkStatus = async () => {
        const statusResponse = await axios.get(
          `https://graph.instagram.com/${mediaResponse.data.id}?fields=status&access_token=${instagramUser.access_token}`
        );
        
        if (statusResponse.data.status === 'FINISHED') {
          // Send DM
          await axios.post(
            `https://graph.instagram.com/${instagramUser.user_id}/conversations`,
            {
              recipient_id: formData.instagram,
              message: 'Here is your processed photo!',
              attachment_media_id: mediaResponse.data.id,
              access_token: instagramUser.access_token
            }
          );
          return true;
        }
        return false;
      };

      // Poll for status
      const interval = setInterval(async () => {
        const success = await checkStatus();
        if (success) clearInterval(interval);
      }, 5000);

    } catch (error) {
      console.error('Instagram DM failed:', error);
    }
  };

  const checkStoryPost = async () => {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/${instagramUser.user_id}/stories?access_token=${instagramUser.access_token}`
      );
      
      return response.data.data.some(story => 
        story.media_url.includes(finalImage.split('|')[1])
      );
    } catch (error) {
      console.error('Story check failed:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!instagramUser) {
      alert('Please authenticate with Instagram first');
      return;
    }

    try {
      await sendInstagramDM();
      
      // Check story every 30 seconds for 5 minutes
      const maxChecks = 10;
      let checks = 0;
      
      const checkInterval = setInterval(async () => {
        const posted = await checkStoryPost();
        checks++;
        
        if (posted || checks >= maxChecks) {
          clearInterval(checkInterval);
          if (posted) {
            await sendCoupon(formData.mobile);
            onComplete();
          }
        }
      }, 30000);

    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  return (
    <div className="form-container">
      {!instagramUser && (
        <button className="instagram-auth-btn" onClick={handleInstagramAuth}>
          Connect Instagram Account
        </button>
      )}

      <form onSubmit={handleSubmit}>
        {/* Existing form fields */}
       
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
          <label htmlFor="instagram">Instagram ID</label>
          <input
            type="text"
            id="instagram"
            placeholder="Enter your Instagram handle"
            value={formData.instagram}
            onChange={(e) => setFormData({...formData, instagram: e.target.value})}
          />
          <span className="error-message">{errors.instagram}</span>
        </div>
        
        
        <button type="submit" className="submit-btn" disabled={!instagramUser}>
          Submit and Share
        </button>
      </form>
    </div>
  );
}




{/* <div className={`form-group ${errors.mobile ? 'invalid' : ''}`}>
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
          <label htmlFor="instagram">Instagram ID</label>
          <input
            type="text"
            id="instagram"
            placeholder="Enter your Instagram handle"
            value={formData.instagram}
            onChange={(e) => setFormData({...formData, instagram: e.target.value})}
          />
          <span className="error-message">{errors.instagram}</span>
        </div> */}