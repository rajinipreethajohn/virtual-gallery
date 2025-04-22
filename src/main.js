import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadow mapping
document.body.appendChild(renderer.domElement);

// Room dimensions
const roomWidth = 20;
const roomHeight = 8;
const roomLength = 20;

// Artwork dimensions
const artWidth = 4;
const artHeight = 3;

// Create the room
function createRoom() {
  const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomLength);
  const roomMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.BackSide });
  const room = new THREE.Mesh(roomGeometry, roomMaterial);
  room.receiveShadow = true; // Allow the room to receive shadows
  scene.add(room);
  
  // Add a floor (slightly below the room) to catch light
  const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomLength);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x606060 });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.1; // Position just below the room
  floor.receiveShadow = true;
  scene.add(floor);
  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
  scene.add(ambientLight);
  
  // Add directional light (acting as sunlight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(roomWidth/2, roomHeight, roomLength/2);
  directionalLight.castShadow = true;
  
  // Configure shadow properties
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);
}

// Load artwork
function addArtwork() {
  const artLoader = new THREE.TextureLoader();
  
  // Example 1: Left wall artwork
  artLoader.load('/assets/images/artwork1.jpg', (texture) => {
    const artGeometry = new THREE.PlaneGeometry(artWidth, artHeight);
    const artMaterial = new THREE.MeshStandardMaterial({ 
      map: texture,
      side: THREE.DoubleSide 
    });
    const artwork1 = new THREE.Mesh(artGeometry, artMaterial);
    artwork1.position.set(-roomWidth/2 + 0.05, roomHeight/2, 0);
    artwork1.rotation.y = Math.PI/2;
    artwork1.receiveShadow = true;
    scene.add(artwork1);
    
    // Add spotlight for this artwork
    const artSpot1 = new THREE.SpotLight(0xffffff, 1.5);
    artSpot1.position.set(-roomWidth/2 + 2, roomHeight - 2, 0);
    artSpot1.target = artwork1;
    artSpot1.angle = Math.PI / 8;
    artSpot1.penumbra = 0.2;
    artSpot1.castShadow = true;
    scene.add(artSpot1);
  });
  
  // Example 2: Right wall artwork
  artLoader.load('/assets/images/artwork2.jpg', (texture) => {
    const artGeometry = new THREE.PlaneGeometry(artWidth, artHeight);
    const artMaterial = new THREE.MeshStandardMaterial({ 
      map: texture,
      side: THREE.DoubleSide 
    });
    const artwork2 = new THREE.Mesh(artGeometry, artMaterial);
    artwork2.position.set(roomWidth/2 - 0.05, roomHeight/2, roomLength/4);
    artwork2.rotation.y = -Math.PI/2;
    scene.add(artwork2);
    
    // Add spotlight for this artwork
    const artSpot2 = new THREE.SpotLight(0xffffff, 1.5);
    artSpot2.position.set(roomWidth/2 - 2, roomHeight - 2, roomLength/4);
    artSpot2.target = artwork2;
    artSpot2.angle = Math.PI / 8;
    artSpot2.penumbra = 0.2;
    artSpot2.castShadow = true;
    scene.add(artSpot2);
  });
  
  // Example 3: Back wall artwork (larger centerpiece)
  artLoader.load('/assets/images/artwork3.jpg', (texture) => {
    const largeArtGeometry = new THREE.PlaneGeometry(artWidth * 1.5, artHeight);
    const artMaterial = new THREE.MeshStandardMaterial({ 
      map: texture,
      side: THREE.DoubleSide 
    });
    const artwork3 = new THREE.Mesh(largeArtGeometry, artMaterial);
    artwork3.position.set(0, roomHeight/2, -roomLength/2 + 0.05);
    scene.add(artwork3);
    
    // Add spotlight for this artwork
    const artSpot3 = new THREE.SpotLight(0xffffff, 1.5);
    artSpot3.position.set(0, roomHeight - 2, -roomLength/2 + 3);
    artSpot3.target = artwork3;
    artSpot3.angle = Math.PI / 8;
    artSpot3.penumbra = 0.2;
    artSpot3.castShadow = true;
    scene.add(artSpot3);
  });
}

// Setup controls
const controls = new PointerLockControls(camera, document.body);

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

// Add audio
function setupAudio() {
  // Create an audio listener and add it to the camera
  const listener = new THREE.AudioListener();
  camera.add(listener);
  
  // Create a global audio source
  const sound = new THREE.Audio(listener);
  
  // Load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('/assets/audio/ambient_music.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    
    // Add a button to start audio (needed due to browser autoplay policies)
    const startButton = document.createElement('button');
    startButton.textContent = 'Start Experience';
    startButton.style.position = 'absolute';
    startButton.style.top = '20px';
    startButton.style.left = '50%';
    startButton.style.transform = 'translateX(-50%)';
    startButton.style.padding = '10px 20px';
    startButton.style.zIndex = '1000';
    
    startButton.addEventListener('click', function() {
      sound.play();
      controls.lock();
      this.remove();
    });
    
    document.body.appendChild(startButton);
  });
}

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
    
    // Apply movement with collision detection
    const oldPosition = camera.position.clone();
    
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    
    // Keep within room boundaries
    const margin = 0.5; // Distance from walls
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
