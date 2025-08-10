// art-studio.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
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
const artCanvas = document.getElementById('artCanvas');
const ctx = artCanvas.getContext('2d');
const colorPicker = document.getElementById('color-picker'); // Brush color
const brushSizeInput = document.getElementById('brush-size');
const brushSizeValueSpan = document.getElementById('brush-size-value');
const clearCanvasBtn = document.getElementById('clear-canvas-btn');
const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');

// New Text Tool Elements
const textInput = document.getElementById('text-input');
const fontSizeInput = document.getElementById('font-size');
const fontSizeValueSpan = document.getElementById('font-size-value');
const textColorPicker = document.getElementById('text-color-picker');
const addTextBtn = document.getElementById('add-text-btn');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let brushColor = colorPicker.value;
let brushSize = parseInt(brushSizeInput.value);

// Text tool properties
let currentText = "";
let fontSize = parseInt(fontSizeInput.value);
let textColor = textColorPicker.value;

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
                const displayName = user.displayName || user.email || 'Anonymous';
                userStatusElement.textContent = `Logged in as: ${displayName} (ID: ${userId})`;
                showMessage(`Welcome to the Art Studio, ${displayName}!`, 'success');
                resizeCanvas(); // Set canvas dimensions after user is confirmed logged in
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

// Canvas drawing functions
function resizeCanvas() {
    // Set canvas dimensions to match its CSS size
    artCanvas.width = artCanvas.offsetWidth;
    artCanvas.height = artCanvas.offsetHeight;
    // Redraw content if needed after resize (not implemented yet for simplicity)
}

function draw(e) {
    if (!isDrawing) return;

    const rect = artCanvas.getBoundingClientRect();
    let clientX, clientY;

    // Handle both mouse and touch events
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    [lastX, lastY] = [currentX, currentY];
}

// Event Listeners for Canvas (Brush Tool)
artCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = artCanvas.getBoundingClientRect();
    [lastX, lastY] = [e.clientX - rect.left, e.clientY - rect.top];
});
artCanvas.addEventListener('mousemove', draw);
artCanvas.addEventListener('mouseup', () => isDrawing = false);
artCanvas.addEventListener('mouseout', () => isDrawing = false);

// Touch events for mobile responsiveness (Brush Tool)
artCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent scrolling when drawing
    isDrawing = true;
    const rect = artCanvas.getBoundingClientRect();
    [lastX, lastY] = [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top];
});
artCanvas.addEventListener('touchmove', draw);
artCanvas.addEventListener('touchend', () => isDrawing = false);
artCanvas.addEventListener('touchcancel', () => isDrawing = false);


// Control Event Listeners (Brush)
colorPicker.addEventListener('input', (e) => {
    brushColor = e.target.value;
});

brushSizeInput.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    brushSizeValueSpan.textContent = brushSize;
});

// Control Event Listeners (Text Tool)
textInput.addEventListener('input', (e) => {
    currentText = e.target.value;
});

fontSizeInput.addEventListener('input', (e) => {
    fontSize = parseInt(e.target.value);
    fontSizeValueSpan.textContent = fontSize;
});

textColorPicker.addEventListener('input', (e) => {
    textColor = e.target.value;
});

addTextBtn.addEventListener('click', () => {
    if (currentText.trim() === "") {
        showMessage("Please enter text to add.", "error");
        return;
    }
    // For simplicity, add text at a fixed position for now.
    // A more advanced feature would allow clicking on canvas to place text.
    const textX = 50; // Example X position
    const textY = 50 + fontSize; // Example Y position, adjust based on font size

    ctx.font = `${fontSize}px Inter, sans-serif`; // Use selected font size and family
    ctx.fillStyle = textColor; // Use selected text color
    ctx.fillText(currentText, textX, textY); // Draw the text

    showMessage("Text added to canvas!", "success");
    // Optionally clear the text input after adding
    // textInput.value = "";
    // currentText = "";
});


// General Controls
clearCanvasBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, artCanvas.width, artCanvas.height);
    showMessage('Canvas cleared!', 'success');
});

backToDashboardBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

// Handle window resize to adjust canvas
window.addEventListener('resize', resizeCanvas);

// Initialize Firebase and Auth when the window loads
window.onload = initializeFirebaseAndAuth;
