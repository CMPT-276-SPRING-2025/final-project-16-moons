import { useState, useEffect } from 'react';

const CLIENT_ID = '317430558522-842q802200ue859sc98bic3n5b2cfql6.apps.googleusercontent.com';
const API_KEY = import.meta.env.VITE_CALENDAR_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile';

function useGoogleAuth() {
  const [authorized, setAuthorized] = useState(false);
  const [userName, setUserName] = useState(null);
  const [tokenClient, setTokenClient] = useState(null);
  const [gapiInited, setGapiInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [content, setContent] = useState('');

  // load external Google API scripts
  useEffect(() => {
    // load gapi
    const scriptGapi = document.createElement('script');
    scriptGapi.src = 'https://apis.google.com/js/api.js';
    scriptGapi.async = true;
    scriptGapi.defer = true;
    scriptGapi.onload = () => {
      window.gapi.load('client', initializeGapiClient);
    };
    document.body.appendChild(scriptGapi);

    // load google identity services
    const scriptGis = document.createElement('script');
    scriptGis.src = 'https://accounts.google.com/gsi/client';
    scriptGis.async = true;
    scriptGis.defer = true;
    scriptGis.onload = gisLoaded;
    document.body.appendChild(scriptGis);

    return () => {
      document.body.removeChild(scriptGapi);
      document.body.removeChild(scriptGis);
    };
  }, []);

  // initialize gapi
  const initializeGapiClient = async () => {
    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    setGapiInited(true);
  };

  // google identity services
  const gisLoaded = () => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // will be set in signIn
    });
    setTokenClient(client);
    setGisInited(true);
  };

  // triggers sign‑in pop-up
  const signIn = async () => {
    if (!tokenClient) return;
    tokenClient.callback = async (resp) => {
      if (resp.error) {
        console.error(resp);
        return;
      }
      setAuthorized(true);
      // fetch user profile information
      try {
        const userInfoResponse = await window.gapi.client.request({
          path: 'https://www.googleapis.com/oauth2/v3/userinfo'
        });
        // set userName to name returned
        setUserName(userInfoResponse.result.name);
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    };

    // request access token
    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  };

  // sign out
  const signOut = () => {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
      setContent('');
      setAuthorized(false);
      setUserName(null);
    }
  };

  return { authorized, userName, signIn, signOut, content, setContent, gapiInited, gisInited };
}

export default useGoogleAuth;