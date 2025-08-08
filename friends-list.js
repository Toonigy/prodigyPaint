// friends-list.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
const logoutBtn = document.getElementById('logout-btn');
const friendsListUl = document.getElementById('friends-list'); // Reference to the UL
const friendIdInput = document.getElementById('friend-id-input'); // Reference to the input
const addFriendBtn = document.getElementById('add-friend-btn'); // Reference to the add button

// Function to display messages to the user
function showMessage(text, type) {
    messageArea.textContent = text;
    messageArea.className = `message ${type}`;
    messageArea.classList.remove('hidden');
    setTimeout(() => {
        messageArea.classList.add('hidden');
    }, 5000);
}

// Function to fetch and display friends from Firestore
async function fetchAndDisplayFriends() {
    if (!userId) {
        console.log("User not authenticated, cannot fetch friends.");
        friendsListUl.innerHTML = '<li class="friend-item"><span>Please log in to see your friends.</span></li>';
        return;
    }

    friendsListUl.innerHTML = '<li class="friend-item"><span>Loading friends...</span></li>'; // Loading state

    try {
        // Reference to the user's private friends collection
        const friendsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/friends`);
        const q = query(friendsCollectionRef);
        const querySnapshot = await getDocs(q);

        friendsListUl.innerHTML = ''; // Clear existing list

        if (querySnapshot.empty) {
            friendsListUl.innerHTML = '<li class="friend-item"><span>No friends added yet.</span></li>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const friendData = doc.data();
            const friendId = doc.id; // The document ID is the friend's UID
            const friendDisplayName = friendData.displayName || `User ${friendId.substring(0, 8)}...`; // Use stored display name or fallback

            const listItem = document.createElement('li');
            listItem.className = 'friend-item';
            listItem.innerHTML = `
                <img src="https://placehold.co/40x40/cccccc/333333?text=User" alt="${friendDisplayName} Profile">
                <span>${friendDisplayName} (ID: ${friendId})</span>
            `;
            friendsListUl.appendChild(listItem);
        });
        showMessage('Friends list loaded successfully!', 'success');

    } catch (error) {
        console.error("Error fetching friends:", error);
        showMessage(`Error loading friends: ${error.message}`, 'error');
        friendsListUl.innerHTML = '<li class="friend-item"><span>Error loading friends.</span></li>';
    }
}

// Function to add a new friend
addFriendBtn.addEventListener('click', async () => {
    const friendIdToAdd = friendIdInput.value.trim();

    if (!userId) {
        showMessage('You must be logged in to add friends.', 'error');
        return;
    }

    if (!friendIdToAdd) {
        showMessage('Please enter a friend\'s User ID.', 'error');
        return;
    }

    if (friendIdToAdd === userId) {
        showMessage('You cannot add yourself as a friend.', 'error');
        return;
    }

    try {
        // Check if the friend already exists in the current user's list
        const friendDocRef = doc(db, `artifacts/${appId}/users/${userId}/friends`, friendIdToAdd);
        const friendDocSnap = await getDocs(query(collection(db, `artifacts/${appId}/users/${userId}/friends`), where('__name__', '==', friendIdToAdd)));

        if (!friendDocSnap.empty) {
            showMessage('This user is already in your friends list.', 'error');
            return;
        }

        // IMPORTANT: To get the actual display name of the friend, you would typically
        // query a *public* user profiles collection (e.g., /artifacts/{appId}/public/data/user_profiles/{friendId}).
        // For this example, we'll use a placeholder or assume the adding user knows the name.
        // For now, we'll just store the ID and a generic display name.
        let friendDisplayName = `User ${friendIdToAdd.substring(0, 8)}...`; // Default fallback

        // If you had a public user profiles collection, you'd do something like:
        /*
        const publicProfileRef = doc(db, `artifacts/${appId}/public/data/user_profiles`, friendIdToAdd);
        const publicProfileSnap = await getDoc(publicProfileRef);
        if (publicProfileSnap.exists()) {
            friendDisplayName = publicProfileSnap.data().displayName || friendDisplayName;
        } else {
            showMessage('User ID not found or no public profile available.', 'error');
            return;
        }
        */

        // Add the friend to the current user's friends subcollection
        await setDoc(friendDocRef, {
            displayName: friendDisplayName, // Store the display name
            addedAt: new Date(),
            // You might add other info like photoURL if fetched from a public profile
        });

        showMessage(`Friend with ID ${friendIdToAdd} added successfully!`, 'success');
        friendIdInput.value = ''; // Clear input
        fetchAndDisplayFriends(); // Refresh the list

    } catch (error) {
        console.error("Error adding friend:", error);
        showMessage(`Failed to add friend: ${error.message}`, 'error');
    }
});


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
                userStatusElement.textContent = `Logged in as: ${displayName} (ID: ${userId})`;
                showMessage(`Welcome to your Friends List, ${displayName}!`, 'success');
                fetchAndDisplayFriends(); // Fetch friends once authenticated
            } else {
                // If user logs out or session expires, redirect back to login
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
        // onAuthStateChanged will handle the redirect to the login page
    } catch (error) {
        console.error("Logout error:", error);
        showMessage(`Logout failed: ${error.message}`, 'error');
    }
});

// Initialize Firebase and Auth when the window loads
window.onload = initializeFirebaseAndAuth;
