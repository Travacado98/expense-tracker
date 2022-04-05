// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApPnFXSSj0JcBNMFKROpewPm0cQCDxlh0",
  authDomain: "expense-tracker-95ecd.firebaseapp.com",
  projectId: "expense-tracker-95ecd",
  storageBucket: "expense-tracker-95ecd.appspot.com",
  messagingSenderId: "200945708018",
  appId: "1:200945708018:web:066be93f6480ca754ed96b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db, collection, addDoc, deleteDoc, doc, onSnapshot, query };
