// profile.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global variables for Firebase config and app ID
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = {
    apiKey: "AIzaSyDh1cFDmqgvZ_3_uiI5jdRV7ttLKtV6c5Q",
    authDomain: "websitetester-9bfb4.firebaseapp.com",
    databaseURL: "https://websitetester-9bfb4-default-rtdb.firebaseio.com",
    projectId: "websitetester-9bfb4",
    storageBucket: "websitetester-9bfb4.firebasestorage.app",
    messagingSenderId: "483339959826",
    appId: "1:483339959826:web:3e9303f92ffb302ca062cb",
    measurementId: "G-WXTK30J819"
};

let app;
let auth;
let db;
let userId = null;

const userStatusElement = document.getElementById('user-status');
const messageArea = document.getElementById('message-area');
const profilePicture = document.getElementById('profile-picture');
const profileUsername = document.getElementById('profile-username');
const profileEmail = document.getElementById('profile-email');
const profileUserId = document.getElementById('profile-userid');
const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
const logoutBtn = document.getElementById('logout-btn');

// Function to display messages to the user
function showMessage(text, type) {
    messageArea.textContent = text;
    messageArea.className = `message ${type}`;
    messageArea.classList.remove('hidden');
    setTimeout(() => {
        messageArea.classList.add('hidden');
    }, 5000);
}

// Initialize Firebase and set up authentication listener
async function initializeFirebaseAndAuth() {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                const displayName = user.displayName || 'N/A';
                const email = user.email || 'N/A';

                userStatusElement.textContent = `Logged in as: ${displayName} (ID: ${userId})`;
                profileUsername.textContent = displayName;
                profileEmail.textContent = email;
                profileUserId.textContent = userId;

                if (user.photoURL) {
                    profilePicture.src = user.photoURL;
                } else {
                    profilePicture.src = "https://placehold.co/128x128/cccccc/333333?text=User";
                }
                showMessage(`Welcome to your profile, ${displayName}!`, 'success');
            } else {
                console.log("No user logged in, redirecting to login page.");
                window.location.href = 'index.html';
            }
        });

    } catch (error) {
        console.error("Error initializing Firebase or setting up auth listener:", error);
        showMessage(`Firebase initialization error: ${error.message}`, 'error');
    }
}

// Event listeners
backToDashboardBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        showMessage('Logged out successfully! Redirecting...', 'success');
    } catch (error) {
        console.error("Logout error:", error);
        showMessage(`Logout failed: ${error.message}`, 'error');
    }
});

// Initialize Firebase and Auth when the window loads
window.onload = initializeFirebaseAndAuth;
