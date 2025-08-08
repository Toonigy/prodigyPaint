// dashboard.js

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

// Get references to key elements
const dashboardUserInfo = document.getElementById('dashboard-user-info');
const profilePicture = document.getElementById('profile-picture');
const logoutBtn = document.getElementById('logout-btn');
const artStudioBtn = document.getElementById('art-studio-btn');
const whatsNewBtn = document.getElementById('whats-new-btn');
const friendsListBtn = document.getElementById('friends-list-btn');
const viewProfileBtn = document.getElementById('view-profile-btn'); // Reference for the new button
const messageArea = document.getElementById('message-area');

// Function to display messages to the user
function showMessage(text, type) {
    messageArea.textContent = text;
    messageArea.className = `message ${type}`; // Apply success or error class
    messageArea.classList.remove('hidden');
    setTimeout(() => {
        messageArea.classList.add('hidden');
    }, 5000); // Hide after 5 seconds
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
                const displayName = user.displayName || user.email || 'Anonymous';
                dashboardUserInfo.textContent = `User: ${displayName} | ID: ${userId}`;

                // Set profile picture
                if (user.photoURL) {
                    profilePicture.src = user.photoURL;
                } else {
                    // Fallback to a generic placeholder if no photoURL
                    profilePicture.src = "https://placehold.co/96x96/cccccc/333333?text=User";
                }
                showMessage(`Welcome back, ${displayName}!`, 'success');
            } else {
                // If user logs out or session expires, redirect back to login
                console.log("No user logged in, redirecting to login page.");
                window.location.href = 'index.html'; // Assuming your login page is index.html
            }
        });

    } catch (error) {
        console.error("Error initializing Firebase or setting up auth listener:", error);
        showMessage(`Firebase initialization error: ${error.message}`, 'error');
    }
}

// Handle logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        showMessage('Logged out successfully! Redirecting...', 'success');
        // onAuthStateChanged will handle the redirect to the login page
    } catch (error) {
        console.error("Logout error:", error);
        showMessage(`Logout failed: ${error.message}`, 'error');
    }
});

// Event listeners for navigation buttons
artStudioBtn.addEventListener('click', () => {
    window.location.href = 'art-studio.html';
});

whatsNewBtn.addEventListener('click', () => {
    window.location.href = 'whats-new.html';
});

friendsListBtn.addEventListener('click', () => {
    window.location.href = 'friends-list.html';
});

viewProfileBtn.addEventListener('click', () => {
    window.location.href = 'profile.html'; // Redirect to the profile page
});

// Initialize Firebase and Auth when the window loads
window.onload = initializeFirebaseAndAuth;
