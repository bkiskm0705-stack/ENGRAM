/* ========================================
   ENGRAM - Firebase Configuration
   ======================================== */

const firebaseConfig = {
    apiKey: "AIzaSyDL-BFglKCPxvVBNmPwjujlQLIKaIUlne0",
    authDomain: "engram-2285d.firebaseapp.com",
    projectId: "engram-2285d",
    storageBucket: "engram-2285d.firebasestorage.app",
    messagingSenderId: "277049919501",
    appId: "1:277049919501:web:afc424e94c6ded1fc96d44",
    measurementId: "G-L47BCML58L"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
