import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initGAPI } from '../components/gapi.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyBSxMqT3mrXWy7wj9B0Sc1Z3HIniGvrtms',
    authDomain: 'jack-of-all-travel-43486.firebaseapp.com',
    projectId: 'jack-of-all-travel-43486',
    storageBucket: 'jack-of-all-travel-43486.firebasestorage.app',
    messagingSenderId: '425487652647',
    appId: '1:425487652647:web:101d86e9768e950a98fb02'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
      const result = await signInWithPopup(auth, provider);
      if (!result) {
          throw new Error("No user returned from Google sign-in.");
      }

      console.log("Firebase google sign-in successful:", result);

      // Store user name
      const name = result.user.displayName;
      localStorage.setItem('name', name);

      // Initialize GAPI after successful Firebase login
      await initGAPI(); 

  } catch (error) {
      console.error('Firebase google sign-in failed:', error.message);
  }
};

export const signOutUser = async () => {
    try {
        await gapi.auth2.getAuthInstance().signOut();
        console.log('User signed out from Google');

        await signOut(auth);
        console.log('User signed out from Firebase');

        localStorage.removeItem('name');
    } catch (error) {
        console.error('Error signing out: ', error);
    }
};

export { app, auth };