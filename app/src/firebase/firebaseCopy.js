// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider,signInWithPopup, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSxMqT3mrXWy7wj9B0Sc1Z3HIniGvrtms",
  authDomain: "jack-of-all-travel-43486.firebaseapp.com",
  projectId: "jack-of-all-travel-43486",
  storageBucket: "jack-of-all-travel-43486.firebasestorage.app",
  messagingSenderId: "425487652647",
  appId: "1:425487652647:web:101d86e9768e950a98fb02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth (app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  signInWithPopup(auth, provider).then((result) => {
    console.log(result);
    const name = result.user.displayName;
    localStorage.setItem("name", name);
    return name;
  }).catch((error) => {
    console.log(error);
  }); 
};

export const signOutUser = () => {
  signOut(auth)
    .then(() => {
      console.log("User signed out");
      localStorage.removeItem("name"); // Remove user name from localStorage
    })
    .catch((error) => {
      console.log(error);
    });
}

export {app, auth};