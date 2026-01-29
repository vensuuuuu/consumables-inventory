import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCB8Bw5iVrt6IOXCj4iKp6E-Xi1UsbPqGE",
  authDomain: "consumable-84781.firebaseapp.com",
  projectId: "consumable-84781",
  storageBucket: "consumable-84781.firebasestorage.app",
  messagingSenderId: "935182151990",
  appId: "1:935182151990:web:962813a95dfaae128bc397",
  measurementId: "G-WNHDWHM5WV"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);