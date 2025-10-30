import { useState, useEffect } from 'react';

export const useNewsletterPopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const checkPopupStatus = async () => {
      // Generate or get session key
      let sessionKey = localStorage.getItem('session_key');
      if (!sessionKey) {
        sessionKey = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('session_key', sessionKey);
      }

      try {
        const response = await fetch(`/api/newsletter/popup/status/?session_key=${sessionKey}`);
        const data = await response.json();
        
        // Show popup after a short delay if needed
        if (data.show_popup) {
          setTimeout(() => {
            setShowPopup(true);
          }, 30000000); // Show after 3 seconds
        }
      } catch (error) {
        console.error('Error checking popup status:', error);
        // Default to showing popup if there's an error
        setTimeout(() => {
          setShowPopup(true);
        }, 30000000); // Show after 3 seconds
      }
    };

    checkPopupStatus();
  }, []);

  return {
    showPopup,
    setShowPopup
  };
};