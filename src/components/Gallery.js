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
  const roomMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x101010,  // Very dark gray, almost black
    side: THREE.BackSide,
    roughness: 0.9,   // Very rough to minimize reflections
    metalness: 0.1    // Low metalness for a matte finish
  });
  const room = new THREE.Mesh(roomGeometry, roomMaterial);
  room.receiveShadow = true;
  scene.add(room);

  // Add a floor (slightly below the room) to catch light
  const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomLength);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x101010,  // Match wall color
    roughness: 0.8,   // Slightly less rough than walls
    metalness: 0.2    // Slightly more metallic than walls
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.1;
  floor.receiveShadow = true;
  scene.add(floor);

  // Add very dim ambient light for minimal base illumination
  const ambientLight = new THREE.AmbientLight(0x202020, 0.2); // Darker, less intense
  scene.add(ambientLight);

  // Create ceiling tracks
  const trackMaterial = new THREE.MeshStandardMaterial({
    color: 0x202020,
    metalness: 0.8,
    roughness: 0.2
  });

  // Main horizontal track
  const horizontalTrackGeometry = new THREE.BoxGeometry(roomWidth - 1, 0.1, 0.2);
  const horizontalTrack = new THREE.Mesh(horizontalTrackGeometry, trackMaterial);
  horizontalTrack.position.set(0, roomHeight - 0.15, 0);
  scene.add(horizontalTrack);

  // Cross tracks for front and back spotlights
  const crossTrackGeometry = new THREE.BoxGeometry(0.2, 0.1, roomLength - 1);
  const frontTrack = new THREE.Mesh(crossTrackGeometry, trackMaterial);
  frontTrack.position.set(0, roomHeight - 0.15, 0);
  scene.add(frontTrack);

  // Add track connectors at intersections
  const connectorGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.15, 16);
  const connectorMaterial = new THREE.MeshStandardMaterial({
    color: 0x303030,
    metalness: 0.9,
    roughness: 0.1
  });
  const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
  connector.rotation.x = Math.PI / 2;
  connector.position.set(0, roomHeight - 0.15, 0);
  scene.add(connector);

  // Add ceiling track lights for each artwork position
  const artworkPositions = [
    // Left wall artwork
    { pos: [-roomWidth / 2 + 0.05, roomHeight - 0.2, roomLength / 3], rot: new THREE.Euler(0, Math.PI / 2, 0) },
    // Right wall artwork
    { pos: [roomWidth / 2 - 0.05, roomHeight - 0.2, -roomLength / 3], rot: new THREE.Euler(0, -Math.PI / 2, 0) },
    // Back wall artwork
    { pos: [0, roomHeight - 0.2, -roomLength / 2 + 0.05], rot: new THREE.Euler(0, 0, 0) },
    // Front wall artwork
    { pos: [0, roomHeight - 0.2, roomLength / 2 - 0.05], rot: new THREE.Euler(0, Math.PI, 0) }
  ];

  artworkPositions.forEach(({ pos, rot }) => {
    // Create spotlight housing (black cylinder)
    const housingGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
    const housingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x000000,
      metalness: 0.7,
      roughness: 0.3
    });
    const housing = new THREE.Mesh(housingGeometry, housingMaterial);
    housing.position.set(pos[0], pos[1], pos[2]);
    housing.rotation.x = Math.PI / 2; // Point cylinder downward
    scene.add(housing);

    // Create spotlight
    const spotLight = new THREE.SpotLight(0xffffff, 3.5); // Increased intensity
    spotLight.position.set(pos[0], pos[1], pos[2]);
    
    // Calculate target position based on artwork position and rotation
    const targetOffset = new THREE.Vector3(0, -1.5, 0); // Adjusted target distance
    targetOffset.applyEuler(rot);
    
    const target = new THREE.Object3D();
    target.position.set(
      pos[0] + targetOffset.x,
      pos[1] + targetOffset.y,
      pos[2] + targetOffset.z
    );
    scene.add(target);
    spotLight.target = target;

    // Configure spotlight for dramatic lighting
    spotLight.angle = Math.PI / 16;      // Even narrower beam
    spotLight.penumbra = 0.1;            // Sharper edges
    spotLight.decay = 1.0;               // Less decay for stronger light
    spotLight.distance = 6;              // Shorter distance for more intensity
    spotLight.castShadow = true;
    spotLight.power = 40;                // Increased power for more dramatic effect

    // High-quality shadows
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.near = 0.1;
    spotLight.shadow.camera.far = 10;
    spotLight.shadow.focus = 1;
    spotLight.shadow.bias = -0.0001;     // Reduce shadow artifacts

    scene.add(spotLight);
  });
}

function addArtwork(artworkManager) {
  const artworkData = [
    {
      imagePath: '/assets/images/FaceDisguise.png',
      position: new THREE.Vector3(-roomWidth / 2 + 0.05, 2.5, roomLength / 3),
      rotation: new THREE.Euler(0, Math.PI / 2, 0),
      metadata: {
        title: 'Face Disguise',
        artist: 'Unknown',
        description: 'A mysterious face.',
        year: 'Unknown',
        spotlight: true,
        spotlightColor: 0xffffff,
        frame: true
      }
    },
    {
      imagePath: '/assets/images/ManWoman.png',
      position: new THREE.Vector3(roomWidth / 2 - 0.05, 2.5, -roomLength / 3),
      rotation: new THREE.Euler(0, -Math.PI / 2, 0),
      metadata: {
        title: 'Man Woman',
        artist: 'Unknown',
        description: 'A depiction of duality.',
        year: 'Unknown',
        spotlight: true,
        spotlightColor: 0xffffff,
        frame: true
      }
    },
    {
      imagePath: '/assets/images/VeinsOfTheCosmos.png',
      position: new THREE.Vector3(0, 2.5, -roomLength / 2 + 0.05),
      rotation: new THREE.Euler(0, 0, 0),
      metadata: {
        title: 'Veins of the Cosmos',
        artist: 'Unknown',
        description: 'Cosmic connections.',
        year: 'Unknown',
        spotlight: true,
        spotlightColor: 0xffffff,
        frame: true
      }
    },
    {
      imagePath: '/assets/images/ThreeSisters.png',
      position: new THREE.Vector3(0, 2.5, roomLength / 2 - 0.05),
      rotation: new THREE.Euler(0, Math.PI, 0),
      metadata: {
        title: 'Three Sisters',
        artist: 'Unknown',
        description: 'A bond of sisterhood.',
        year: 'Unknown',
        spotlight: true,
        spotlightColor: 0xffffff,
        frame: true
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
        year: 'Unknown',
        spotlight: true,
        spotlightColor: 0xffffff,
        frame: true
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
