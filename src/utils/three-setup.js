import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Set pixel ratio for sharpness
renderer.shadowMap.enabled = true; // Enable shadow mapping

// Get max anisotropy for texture filtering
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

/* ----------------------------------------------------------
   ✅ Real-time Loading Manager (Step 6b)
   Tracks image, texture, and audio loading in all modules
---------------------------------------------------------- */
const loadingManager = new THREE.LoadingManager();

// Update progress bar width
loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
  const progress = (itemsLoaded / itemsTotal) * 100;
  const progressBar = document.getElementById('loading-progress');
  if (progressBar) progressBar.style.width = `${progress}%`;
};

// When all assets are loaded
loadingManager.onLoad = function () {
  const startButton = document.getElementById('start-button');
  const loadingScreen = document.getElementById('loading-screen');

  // Show "Enter Gallery" button
  if (startButton) {
    startButton.style.display = 'block';
  }

  // Wait for the user to click before hiding the loading screen
  if (startButton && loadingScreen) {
    startButton.addEventListener('click', () => {
      loadingScreen.style.transition = 'opacity 1s ease';
      loadingScreen.style.opacity = '0';
      setTimeout(() => (loadingScreen.style.display = 'none'), 1000);
    });
  }
};

export { scene, camera, renderer, maxAnisotropy, loadingManager };
