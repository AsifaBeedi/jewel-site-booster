import { supabase } from "@/integrations/supabase/client";

// Generate a session ID that persists during the browser session
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Extract UTM parameters from URL
export const getUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
};

// Store UTM parameters in sessionStorage for the entire session
const storeUTMParams = () => {
  const utmParams = getUTMParams();
  if (Object.values(utmParams).some(v => v !== undefined)) {
    sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
  }
};

// Retrieve stored UTM parameters
const getStoredUTMParams = () => {
  const stored = sessionStorage.getItem('utm_params');
  return stored ? JSON.parse(stored) : {};
};

// Track page visit
export const trackPageVisit = async (pagePath: string) => {
  try {
    storeUTMParams();
    const utmParams = getStoredUTMParams();
    
    await supabase.functions.invoke('track-event', {
      body: {
        type: 'page_visit',
        data: {
          page_path: pagePath,
          ...utmParams,
          referrer: document.referrer,
          session_id: getSessionId(),
        },
      },
    });
  } catch (error) {
    console.error('Error tracking page visit:', error);
  }
};

// Track button click
export const trackClick = async (buttonId: string, buttonText: string) => {
  try {
    const utmParams = getStoredUTMParams();
    
    await supabase.functions.invoke('track-event', {
      body: {
        type: 'click',
        data: {
          button_id: buttonId,
          button_text: buttonText,
          page_path: window.location.pathname,
          ...utmParams,
          session_id: getSessionId(),
        },
      },
    });
  } catch (error) {
    console.error('Error tracking click:', error);
  }
};
