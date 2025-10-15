import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { camera } from '../utils/three-setup.js';

// Setup controls
const controls = new PointerLockControls(camera, document.body);

// ✅ Ensure proper rotation order for clamping
camera.rotation.order = 'YXZ';

// Add click event to lock/unlock controls
document.addEventListener('click', () => {
  if (!controls.isLocked) {
    controls.lock();
  }
});

// Movement controls
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

// ✅ Helper to clamp camera pitch (prevents ceiling/floor flipping)
function clampCameraRotation() {
  const maxPitch = Math.PI / 2.8;  // Look up limit (~64°)
  const minPitch = -Math.PI / 2.8; // Look down limit (~-64°)
  camera.rotation.x = Math.max(minPitch, Math.min(maxPitch, camera.rotation.x));
}

// Listen for key presses
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = true;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = true;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = true;
      break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = true;
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = false;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = false;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = false;
      break;
  }
});

// ✅ Export the clamp function to use in main.js animation loops
export { controls, velocity, direction, moveForward, moveBackward, moveLeft, moveRight, clampCameraRotation };
