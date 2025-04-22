import * as THREE from 'three';
import { scene } from '../utils/three-setup.js';

// Room dimensions
const roomWidth = 20;
const roomHeight = 8;
const roomLength = 20;

// Artwork dimensions
const artWidth = 4;
const artHeight = 3;

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

function addArtwork() {
  const artLoader = new THREE.TextureLoader();

  // Artwork 1: Left wall
  artLoader.load('/assets/images/FaceDisguise.png', (texture) => {
    const artGeometry = new THREE.PlaneGeometry(artWidth, artHeight);
    const artMaterial = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
    const artwork = new THREE.Mesh(artGeometry, artMaterial);
    artwork.position.set(-roomWidth / 2 + 0.05, roomHeight / 2, roomLength / 3);
    artwork.rotation.y = Math.PI / 2;
    artwork.receiveShadow = true;
    scene.add(artwork);

    const artSpot = new THREE.SpotLight(0xffffff, 1.5);
    artSpot.position.set(-roomWidth / 2 + 2, roomHeight - 2, roomLength / 3);
    artSpot.target = artwork;
    artSpot.angle = Math.PI / 8;
    artSpot.penumbra = 0.2;
    artSpot.castShadow = true;
    scene.add(artSpot);
  });

  // Artwork 2: Right wall
  artLoader.load('/assets/images/ManWoman.png', (texture) => {
    const artGeometry = new THREE.PlaneGeometry(artWidth, artHeight);
    const artMaterial = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
    const artwork = new THREE.Mesh(artGeometry, artMaterial);
    artwork.position.set(roomWidth / 2 - 0.05, roomHeight / 2, -roomLength / 3);
    artwork.rotation.y = -Math.PI / 2;
    artwork.receiveShadow = true;
    scene.add(artwork);

    const artSpot = new THREE.SpotLight(0xffffff, 1.5);
    artSpot.position.set(roomWidth / 2 - 2, roomHeight - 2, -roomLength / 3);
    artSpot.target = artwork;
    artSpot.angle = Math.PI / 8;
    artSpot.penumbra = 0.2;
    artSpot.castShadow = true;
    scene.add(artSpot);
  });

  // Artwork 3: Back wall
  artLoader.load('/assets/images/VeinsOfTheCosmos.png', (texture) => {
    const artGeometry = new THREE.PlaneGeometry(artWidth * 1.2, artHeight);
    const artMaterial = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
    const artwork = new THREE.Mesh(artGeometry, artMaterial);
    artwork.position.set(0, roomHeight / 2, -roomLength / 2 + 0.05);
    artwork.receiveShadow = true;
    scene.add(artwork);

    const artSpot = new THREE.SpotLight(0xffffff, 1.5);
    artSpot.position.set(0, roomHeight - 2, -roomLength / 2 + 2);
    artSpot.target = artwork;
    artSpot.angle = Math.PI / 8;
    artSpot.penumbra = 0.2;
    artSpot.castShadow = true;
    scene.add(artSpot);
  });

  // Artwork 4: Front wall
  artLoader.load('/assets/images/ThreeSisters.png', (texture) => {
    const artGeometry = new THREE.PlaneGeometry(artWidth * 1.2, artHeight);
    const artMaterial = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
    const artwork = new THREE.Mesh(artGeometry, artMaterial);
    artwork.position.set(0, roomHeight / 2, roomLength / 2 - 0.05);
    artwork.rotation.y = Math.PI;
    artwork.receiveShadow = true;
    scene.add(artwork);

    const artSpot = new THREE.SpotLight(0xffffff, 1.5);
    artSpot.position.set(0, roomHeight - 2, roomLength / 2 - 2);
    artSpot.target = artwork;
    artSpot.angle = Math.PI / 8;
    artSpot.penumbra = 0.2;
    artSpot.castShadow = true;
    scene.add(artSpot);
  });

    // Artwork 5: Center
    artLoader.load('/assets/images/image.png', (texture) => {
      const artGeometry = new THREE.PlaneGeometry(artWidth / 2, artHeight / 2);
      const artMaterial = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
      const artwork = new THREE.Mesh(artGeometry, artMaterial);
      artwork.position.set(0, roomHeight / 4, 0);
      artwork.receiveShadow = true;
      scene.add(artwork);
  
      const artSpot = new THREE.SpotLight(0xffffff, 1.5);
      artSpot.position.set(0, roomHeight / 2, 0);
      artSpot.target = artwork;
      artSpot.angle = Math.PI / 8;
      artSpot.penumbra = 0.2;
      artSpot.castShadow = true;
      scene.add(artSpot);
    });
}

export { createRoom, addArtwork };
