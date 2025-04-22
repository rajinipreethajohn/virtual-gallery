import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { scene, camera, renderer } from './utils/three-setup.js';
import { createRoom, addArtwork } from './components/Gallery.js';
import { controls, velocity, direction, moveForward, moveBackward, moveLeft, moveRight } from './components/Controls.js';
import { setupAudio } from './components/AudioPlayer.js';

document.body.appendChild(renderer.domElement);

createRoom();
addArtwork();
setupAudio();

// Collision detection
const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

// Render loop
const clock = new THREE.Clock();
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
    const roomLength = 20;
    if (camera.position.x < -roomWidth/2 + margin) camera.position.x = -roomWidth/2 + margin;
    if (camera.position.x > roomWidth/2 - margin) camera.position.x = roomWidth/2 - margin;
    if (camera.position.z < -roomLength/2 + margin) camera.position.z = -roomLength/2 + margin;
    if (camera.position.z > roomLength/2 - margin) camera.position.z = roomLength/2 - margin;
  }
  
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
  createRoom();
  addArtwork();
  setupAudio();
  
  // Initial camera position
  camera.position.set(0, 1.6, roomLength/3); // Start position in the room
  
  // Add instructions
  const instructions = document.createElement('div');
  instructions.innerHTML = `
    <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); 
                background: rgba(0,0,0,0.5); color: white; padding: 10px; border-radius: 5px; 
                font-family: Arial, sans-serif; text-align: center;">
      <p>Click to start | Move: W,A,S,D or Arrow Keys | Look: Mouse</p>
    </div>
  `;
  document.body.appendChild(instructions);
  
  animate();
}

// Start the application
init();
