import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { scene, camera, renderer } from './utils/three-setup.js';
import { createRoom, addArtwork } from './components/Gallery.js';
import {
  controls,
  velocity,
  direction,
  moveForward,
  moveBackward,
  moveLeft,
  moveRight,
  clampCameraRotation,   // ⬅️ add this new import
} from './components/Controls.js';
import { setupAudio } from './components/AudioPlayer.js';
import { ArtworkManager } from './components/Artwork.js';

// 🧭 Set initial spawn reference — unified for desktop & mobile
function setupSpawnReference(scene, camera, isMobile) {
  // Set consistent camera position and direction
  camera.position.set(0, 1.6, 5);
  camera.lookAt(0, 1.5, 0); // face toward the main wall

  // Sync pointer lock controls with camera (for desktop)
  controls.getObject().position.copy(camera.position);
  controls.getObject().rotation.copy(camera.rotation);

  if (isMobile) {
    // Optional: subtle floor marker for mobile orientation
    const loader = new THREE.TextureLoader();
    const markerTex = loader.load('./assets/images/start_marker.png'); // placeholder texture
    const markerGeo = new THREE.CircleGeometry(0.4, 32);
    const markerMat = new THREE.MeshBasicMaterial({
      map: markerTex,
      transparent: true,
      opacity: 0.6,
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.rotation.x = -Math.PI / 2;
    marker.position.set(0, 0.01, 0);
    scene.add(marker);
  }
}



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
// ✨ Show signature after entering the gallery
const startButton = document.getElementById('start-button');
if (startButton) {
  startButton.addEventListener('click', () => {
    setTimeout(() => {
      signature.style.opacity = '1';
    }, 2000); // fade in 2s after entry
  });
}


// 🖋️ Add your signature overlay
const signature = document.createElement('img');
signature.src = '/public/assets/images/signature.png';
signature.alt = 'Rajini Preetha John Signature';
signature.className = 'artist-signature';
document.body.appendChild(signature);

// ✅ Prevent pull-to-refresh / overscroll on mobile browsers
if (isMobile) {
  document.body.style.overscrollBehavior = 'none';
  document.documentElement.style.overscrollBehavior = 'none';
  document.body.style.touchAction = 'none';

  // Prevent the downward swipe from triggering a refresh
  window.addEventListener(
    'touchmove',
    (event) => {
      // Allow pinch zoom but block one-finger drags
      if (event.touches.length > 1 || (event.scale && event.scale !== 1)) return;
      event.preventDefault();
    },
    { passive: false }
  );
}

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
// Mobile controls (touch look + movement)
if (isMobile) {
  document.body.removeEventListener('click', () => {
    controls.lock();
  });

  // Look controls (already defined)
  document.body.addEventListener('touchstart', handleTouchStart);
  document.body.addEventListener('touchmove', handleTouchMove);
  document.body.addEventListener('touchend', handleTouchEnd);

  // Add a simple virtual joystick
  
  const joystick = document.createElement('div');
  joystick.className = 'joystick-control';

  joystick.style.position = 'absolute';
  joystick.style.bottom = '100px';
  joystick.style.left = '40px';
  joystick.style.width = '100px';
  joystick.style.height = '100px';
  joystick.style.borderRadius = '50%';
  joystick.style.background = 'rgba(255,255,255,0.1)';
  joystick.style.border = '2px solid rgba(255,255,255,0.3)';
  joystick.style.touchAction = 'none';
  joystick.style.zIndex = '999';
  document.body.appendChild(joystick);

  let joystickActive = false;
  let moveX = 0, moveY = 0;

  joystick.addEventListener('touchstart', (e) => {
    joystickActive = true;
    const touch = e.touches[0];
    joystick.dataset.startX = touch.clientX;
    joystick.dataset.startY = touch.clientY;
  });

  joystick.addEventListener('touchmove', (e) => {
    if (!joystickActive) return;
    const touch = e.touches[0];
    const dx = touch.clientX - joystick.dataset.startX;
    const dy = touch.clientY - joystick.dataset.startY;
    moveX = Math.max(-1, Math.min(1, dx / 40));
    moveY = Math.max(-1, Math.min(1, dy / 40));
  });

  joystick.addEventListener('touchend', () => {
    joystickActive = false;
    moveX = 0;
    moveY = 0;
  });

  // Override animate() movement for mobile
  const originalAnimate = animate;
  animate = function mobileAnimate() {
    requestAnimationFrame(mobileAnimate);
    const delta = clock.getDelta();

    if (joystickActive) {
  const moveSpeed = 5 * delta;

  // Move relative to the camera's facing direction (natural control)
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0; // prevent vertical drift
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(camera.up, forward).normalize();

  // Use joystick input to move in facing direction
  camera.position.addScaledVector(forward, -moveY * moveSpeed);
  camera.position.addScaledVector(right, moveX * moveSpeed);
}

    // Clamp camera inside room
    const margin = 0.5;
    const roomWidth = 20;
    const roomLength = 20;
    camera.position.x = Math.min(Math.max(camera.position.x, -roomWidth/2 + margin), roomWidth/2 - margin);
    camera.position.z = Math.min(Math.max(camera.position.z, -roomLength/2 + margin), roomLength/2 - margin);

    // ✅ Prevent over-tilting on mobile too
    clampCameraRotation();

    artworkManager.update();
    renderer.render(scene, camera);
  };
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

  // ✅ Clamp camera pitch so it can’t spin to the ceiling/floor
  clampCameraRotation();
  
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

   // 🧭 Set initial camera spawn orientation (fixed view)
  setupSpawnReference(scene, camera, isMobile);




  // Setup audio (adds its own start button)
  setupAudio();

 


  // Add instructions dynamically
  const instructions = document.createElement('div');
  instructions.id = 'instructions';
  instructions.style.position = 'absolute';
  instructions.style.left = '50%';
  instructions.style.transform = 'translateX(-50%)';
  instructions.style.background = 'rgba(0, 0, 0, 0.5)';
  instructions.style.color = 'white';
  instructions.style.padding = '10px 14px';
  instructions.style.borderRadius = '8px';
  instructions.style.fontFamily = 'Arial, sans-serif';
  instructions.style.textAlign = 'center';
  instructions.style.zIndex = '1000';

  if (isMobile) {
    // 📱 Mobile-friendly positioning
    instructions.style.bottom = '120px'; // Higher up to avoid joystick & audio button overlap
    instructions.style.width = '80%';
    instructions.style.fontSize = '14px';
    instructions.innerHTML = `
      <p style="margin:0;">Touch & Drag to look around</p>
      <p style="margin:0;">Use joystick below to move</p>
      <p style="margin:0;">Approach artwork for details</p>
    `;
  } else {
    // 🖥️ Desktop instructions
    instructions.style.bottom = '20px';
    instructions.innerHTML = `
      <p style="margin:0;">Click to start</p>
      <p style="margin:0;">Move: W,A,S,D or Arrow Keys | Look: Mouse</p>
      <p style="margin:0;">Approach artwork for details</p>
    `;
  }

  document.body.appendChild(instructions);

  // 🧩 Optional: fade out instructions after a few seconds on mobile
  if (isMobile) {
    setTimeout(() => {
      instructions.style.transition = 'opacity 1.5s';
      instructions.style.opacity = '0';
      setTimeout(() => instructions.remove(), 2000);
    }, 6000); // disappears after 6 seconds
  }

  // Start the render loop
  animate();
  clampCameraRotation();

}


// Start the application
init();
// 🖱️ Remove bottom instruction overlay after entering (desktop)
if (!isMobile) {
  controls.addEventListener('lock', () => {
    const instructions = document.getElementById('instructions');
    if (instructions) {
      instructions.style.transition = 'opacity 1.5s';
      instructions.style.opacity = '0';
      setTimeout(() => instructions.remove(), 1500);
    }
  });
}
