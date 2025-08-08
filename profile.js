// profile.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"; // Import getDoc and setDoc

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
let currentUserId = null; // Renamed to avoid confusion with viewedUserId

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

// Function to display profile data
function displayProfileData(userData) {
    const displayName = userData.displayName || 'N/A';
    const email = userData.email || 'N/A';
    const id = userData.uid || 'N/A';
    const photoURL = userData.photoURL || "https://placehold.co/128x128/cccccc/333333?text=User";

    profileUsername.textContent = displayName;
    profileEmail.textContent = email;
    profileUserId.textContent = id;
    profilePicture.src = photoURL;
}

// Function to fetch and display a specific user's public profile
async function fetchAndDisplayPublicProfile(viewedUserId) {
    try {
        const publicProfileRef = doc(db, `artifacts/${appId}/public/data/user_profiles`, viewedUserId);
        const publicProfileSnap = await getDoc(publicProfileRef);

        if (publicProfileSnap.exists()) {
            const profileData = publicProfileSnap.data();
            // Add uid to the data for display
            profileData.uid = viewedUserId;
            displayProfileData(profileData);
            userStatusElement.textContent = `Viewing profile of: ${profileData.displayName || 'Anonymous'} (ID: ${viewedUserId})`;
            showMessage(`Displaying profile for ${profileData.displayName || 'this user'}.`, 'success');
        } else {
            console.warn(`Public profile for user ID ${viewedUserId} not found.`);
            // Fallback to displaying current user's profile if public profile not found
            if (auth.currentUser) {
                displayProfileData(auth.currentUser);
                userStatusElement.textContent = `Logged in as: ${auth.currentUser.displayName || 'Anonymous'} (ID: ${auth.currentUser.uid})`;
                showMessage('Public profile not found. Displaying your own profile.', 'error');
            } else {
                // If no public profile and no current user, show N/A
                displayProfileData({ displayName: 'N/A', email: 'N/A', uid: viewedUserId, photoURL: "https://placehold.co/128x128/cccccc/333333?text=User" });
                userStatusElement.textContent = `Profile not found for ID: ${viewedUserId}`;
                showMessage('Profile not found and not logged in.', 'error');
            }
        }
    } catch (error) {
        console.error("Error fetching public profile:", error);
        showMessage(`Error loading profile: ${error.message}`, 'error');
    }
}

// Initialize Firebase and set up authentication listener
async function initializeFirebaseAndAuth() {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Get userId from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const viewedUserId = urlParams.get('userId');

        if (viewedUserId) {
            // If a userId is in the URL, try to display that user's public profile
            await fetchAndDisplayPublicProfile(viewedUserId);
        }

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUserId = user.uid;
                // If no specific user was requested via URL, or if the requested user is the current user
                if (!viewedUserId || viewedUserId === currentUserId) {
                    displayProfileData(user);
                    userStatusElement.textContent = `Logged in as: ${user.displayName || 'Anonymous'} (ID: ${currentUserId})`;
                    showMessage(`Welcome to your profile, ${user.displayName || 'Anonymous'}!`, 'success');

                    // Also ensure the current user's public profile is up-to-date
                    // This is crucial for other users to view their profile correctly
                    const publicProfileRef = doc(db, `artifacts/${appId}/public/data/user_profiles`, currentUserId);
                    await setDoc(publicProfileRef, {
                        displayName: user.displayName || user.email,
                        email: user.email,
                        photoURL: user.photoURL || null,
                        lastUpdated: new Date()
                    }, { merge: true }); // Use merge to update existing fields without overwriting others
                }
            } else {
                // If no user is logged in AND no specific user was requested via URL, redirect to login
                if (!viewedUserId) {
                    console.log("No user logged in, redirecting to login page.");
                    window.location.href = 'index.html';
                } else {
                    // If a specific user was requested but current user is not logged in,
                    // the public profile fetch already happened. Just ensure status is clear.
                    userStatusElement.textContent = `Not logged in. Viewing profile for ID: ${viewedUserId || 'N/A'}`;
                }
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
