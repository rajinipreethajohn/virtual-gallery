import * as THREE from 'three';
import { scene } from '../utils/three-setup.js';

// Room dimensions
const roomWidth = 20;
const roomHeight = 12;
const roomLength = 20;

// Artwork dimensions
const artWidth = 3.5;
const artHeight = 2.5;

function createRoom() {
  const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomLength);
  const roomMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.BackSide });
  const room = new THREE.Mesh(roomGeometry, roomMaterial);
  room.receiveShadow = true; // Allow the room to receive shadows
  scene.add(room);

  // Add a floor (slightly below the room) to catch light
  const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomLength);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.1; // Position just below the room
  floor.receiveShadow = true;
  scene.add(floor);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x606060); // Soft white light
  scene.add(ambientLight);

  // Add directional light (acting as sunlight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(roomWidth / 2, roomHeight, roomLength / 2);
  directionalLight.castShadow = true;

  // Configure shadow properties
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);
}

function addArtwork(artworkManager) {
  const artworkData = [
    {
      imagePath: '/assets/images/FaceDisguise.png',
      position: new THREE.Vector3(-roomWidth / 2 + 0.05, 3.167, roomLength / 3),
      rotation: new THREE.Euler(0, Math.PI / 2, 0),
      metadata: {
        title: 'Face Disguise',
        artist: 'Unknown',
        description: 'A mysterious face.',
        year: 'Unknown'
      }
    },
    {
      imagePath: '/assets/images/ManWoman.png',
      position: new THREE.Vector3(roomWidth / 2 - 0.05, 3.167, -roomLength / 3),
      rotation: new THREE.Euler(0, -Math.PI / 2, 0),
      metadata: {
        title: 'Man Woman',
        artist: 'Unknown',
        description: 'A depiction of duality.',
        year: 'Unknown'
      }
    },
    {
      imagePath: '/assets/images/VeinsOfTheCosmos.png',
      position: new THREE.Vector3(0, 3.167, -roomLength / 2 + 0.05),
      rotation: new THREE.Euler(0, 0, 0),
      metadata: {
        title: 'Veins of the Cosmos',
        artist: 'Unknown',
        description: 'Cosmic connections.',
        year: 'Unknown'
      }
    },
    {
      imagePath: '/assets/images/ThreeSisters.png',
      position: new THREE.Vector3(0, 3.167, roomLength / 2 - 0.05),
      rotation: new THREE.Euler(0, Math.PI, 0),
      metadata: {
        title: 'Three Sisters',
        artist: 'Unknown',
        description: 'A bond of sisterhood.',
        year: 'Unknown'
      }
    },
    {
      imagePath: '/assets/images/image.png',
      position: new THREE.Vector3(0, roomHeight / 4, 0),
      rotation: new THREE.Euler(0, 0, 0),
      metadata: {
        title: 'Center Image',
        artist: 'Unknown',
        description: 'A central piece.',
        year: 'Unknown'
      }
    }
  ];

  artworkData.forEach(data => {
    artworkManager.loadArtwork(
      data.imagePath,
      data.position,
      data.rotation,
      new THREE.Vector3(artWidth, artHeight, 1), // Scale
      data.metadata
    );
  });
}

export { createRoom, addArtwork };
