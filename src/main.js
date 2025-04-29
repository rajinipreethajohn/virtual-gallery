import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { scene, camera, renderer } from './utils/three-setup.js';
import { createRoom, addArtwork } from './components/Gallery.js';
import { controls, velocity, direction, moveForward, moveBackward, moveLeft, moveRight } from './components/Controls.js';
import { setupAudio } from './components/AudioPlayer.js';
import { ArtworkManager } from './components/Artwork.js';

// Mobile detection
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}


const isMobile = isMobileDevice();

// Set pixel ratio for mobile
if (isMobile) {
  renderer.setPixelRatio(window.devicePixelRatio / 2); // Reduce pixel ratio
}

document.body.appendChild(renderer.domElement);

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  if (!touchStartX || !touchStartY) {
    return;
  }

  let touchEndX = event.touches[0].clientX;
  let touchEndY = event.touches[0].clientY;

  let dx = touchEndX - touchStartX;
  let dy = touchEndY - touchStartY;

  // Adjust camera rotation based on touch movement
  camera.rotation.y += dx * 0.005;
  camera.rotation.x += dy * 0.005;

  touchStartX = touchEndX;
  touchStartY = touchEndY;
}

function handleTouchEnd() {
  touchStartX = 0;
  touchStartY = 0;
}

// Initialize components
const artworkManager = new ArtworkManager(scene, camera);
const clock = new THREE.Clock();

// Disable pointer lock on mobile
if (isMobile) {
  document.body.removeEventListener('click', () => {
    controls.lock();
  });

  document.body.addEventListener('touchstart', handleTouchStart);
  document.body.addEventListener('touchmove', handleTouchMove);
  document.body.addEventListener('touchend', handleTouchEnd);
}

// Room dimensions (shared between Gallery.js and boundary checks)
const roomLength = 20;

// Collision detection
const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

// Render loop
function animate() {
  requestAnimationFrame(animate);
  
  if (controls.isLocked) {
    const delta = clock.getDelta();
    
    // Calculate movement
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();
    
    if (moveForward || moveBackward) velocity.z -= direction.z * 20.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 20.0 * delta;
    
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    
    // Keep within room boundaries
    const margin = 0.5; // Distance from walls
    const roomWidth = 20;
    if (camera.position.x < -roomWidth/2 + margin) camera.position.x = -roomWidth/2 + margin;
    if (camera.position.x > roomWidth/2 - margin) camera.position.x = roomWidth/2 - margin;
    if (camera.position.z < -roomLength/2 + margin) camera.position.z = -roomLength/2 + margin;
    if (camera.position.z > roomLength/2 - margin) camera.position.z = roomLength/2 - margin;
  }
  
  // Update artwork proximity detection
  artworkManager.update();
  
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize everything
function init() {
  // Create the room and add artwork
  createRoom();
  addArtwork(artworkManager);
  
  // Setup audio (this adds its own start button)
  setupAudio();
  
  // Initial camera position
  camera.position.set(0, 1.6, roomLength/3); // Start position in the room
  
  // Add instructions
  const instructions = document.createElement('div');
  instructions.innerHTML = `
    <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); 
                background: rgba(0,0,0,0.5); color: white; padding: 10px; border-radius: 5px; 
                font-family: Arial, sans-serif; text-align: center;">
      <p>${isMobile ? 'Move: Touch & Drag | Approach artwork for details' : 'Click to start | Move: W,A,S,D or Arrow Keys | Look: Mouse | Approach artwork for details'}</p>
    </div>
  `;
  document.body.appendChild(instructions);
  
  // Start the render loop
  animate();
}

// Start the application
init();
