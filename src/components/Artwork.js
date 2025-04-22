// Artwork.js - Handles artwork interactions in the virtual gallery

import * as THREE from 'three';

export class ArtworkManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.artworks = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedArtwork = null;
    this.infoPanel = document.getElementById('artwork-info');
    this.artworkTitle = document.getElementById('artwork-title');
    this.artworkDescription = document.getElementById('artwork-description');
    
    // Setup event listeners
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('click', this.onMouseClick.bind(this));
    
    // Proximity detection
    this.proximityDistance = 5; // Distance at which artwork info appears
  }
  
  // Add a new artwork to the collection
  addArtwork(mesh, title, artist, description, year) {
    this.artworks.push({
      mesh,
      info: {
        title,
        artist,
        description,
        year
      },
      originalMaterial: mesh.material.clone()
    });
    
    // Return the mesh for further customization if needed
    return mesh;
  }
  
  // Load artwork from image with metadata
  loadArtwork(imagePath, position, rotation, scale, metadata) {
    const loader = new THREE.TextureLoader();
    
    return new Promise((resolve) => {
      loader.load(imagePath, (texture) => {
        // Calculate aspect ratio for the frame
        const aspectRatio = texture.image.width / texture.image.height;
        const width = scale.x;
        const height = width / aspectRatio;
        
        // Create the artwork mesh
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide
        });
        
        const artwork = new THREE.Mesh(geometry, material);
        artwork.position.copy(position);
        artwork.rotation.copy(rotation);
        artwork.castShadow = true;
        artwork.receiveShadow = true;
        
        // Add to scene
        this.scene.add(artwork);
        
        // Add to managed artworks
        const managedArtwork = this.addArtwork(
          artwork,
          metadata.title,
          metadata.artist,
          metadata.description,
          metadata.year
        );
        
        // Add frame if requested
        if (metadata.frame) {
          this.addFrame(artwork, width, height, metadata.frameColor || 0x8b4513);
        }
        
        // Add specific lighting for this artwork if requested
        if (metadata.spotlight) {
          this.addSpotlight(artwork, position, metadata.spotlightColor || 0xffffff);
        }
        
        resolve(managedArtwork);
      });
    });
  }
  
  // Add a decorative frame around artwork
  addFrame(artworkMesh, width, height, color) {
    const frameWidth = 0.1; // Width of the frame border
    
    // Create outer frame
    const outerGeometry = new THREE.PlaneGeometry(
      width + frameWidth * 2,
      height + frameWidth * 2
    );
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.3
    });
    
    const frame = new THREE.Mesh(outerGeometry, frameMaterial);
    frame.position.copy(artworkMesh.position);
    frame.rotation.copy(artworkMesh.rotation);
    
    // Move frame slightly behind artwork to avoid z-fighting
    const offset = new THREE.Vector3(0, 0, -0.01);
    offset.applyEuler(artworkMesh.rotation);
    frame.position.add(offset);
    
    this.scene.add(frame);
    return frame;
  }
  
  // Add a spotlight focused on the artwork
  addSpotlight(artworkMesh, position, color) {
    const spotLight = new THREE.SpotLight(color, 1.5);
    
    // Position the light based on artwork orientation
    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyEuler(artworkMesh.rotation);
    direction.multiplyScalar(-3); // Move light 3 units "in front" of artwork
    
    spotLight.position.copy(position).add(direction);
    
    // Calculate position for the light to point at the artwork
    const target = new THREE.Object3D();
    target.position.copy(position);
    this.scene.add(target);
    spotLight.target = target;
    
    // Configure spotlight
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.2;
    spotLight.decay = 2;
    spotLight.distance = 20;
    spotLight.castShadow = true;
    
    this.scene.add(spotLight);
    return spotLight;
  }
  
  // Handle mouse movement for hovering effect
  onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  
  // Handle mouse clicks for selecting artwork
  onMouseClick(event) {
    // Update raycaster with camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Find intersected objects
    const intersects = this.raycaster.intersectObjects(
      this.artworks.map(artwork => artwork.mesh)
    );
    
    // If we intersected with an artwork
    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      const artwork = this.artworks.find(art => art.mesh === clickedMesh);
      
      if (artwork) {
        this.selectArtwork(artwork);
      }
    } else {
      this.deselectArtwork();
    }
  }
  
  // Select an artwork and show its info
  selectArtwork(artwork) {
    // Deselect previous artwork if any
    if (this.selectedArtwork && this.selectedArtwork !== artwork) {
      this.selectedArtwork.mesh.material = this.selectedArtwork.originalMaterial.clone();
    }
    
    // Select new artwork
    this.selectedArtwork = artwork;
    
    // Apply highlight effect
    const highlightMaterial = artwork.originalMaterial.clone();
    highlightMaterial.emissive = new THREE.Color(0x222222);
    artwork.mesh.material = highlightMaterial;
    
    // Show artwork info
    this.showArtworkInfo(artwork.info);
  }
  
  // Deselect current artwork
  deselectArtwork() {
    if (this.selectedArtwork) {
      this.selectedArtwork.mesh.material = this.selectedArtwork.originalMaterial.clone();
      this.selectedArtwork = null;
      this.hideArtworkInfo();
    }
  }
  
  // Show artwork information panel
  showArtworkInfo(info) {
    this.artworkTitle.textContent = `${info.title} (${info.year})`;
    this.artworkDescription.textContent = `By ${info.artist}. ${info.description}`;
    this.infoPanel.style.display = 'block';
  }
  
  // Hide artwork information panel
  hideArtworkInfo() {
    this.infoPanel.style.display = 'none';
  }
  
  // Check for proximity to artworks and show info when close
  checkProximity() {
    if (!this.camera) return;
    
    let closestDistance = Infinity;
    let closestArtwork = null;
    
    // Check distance to each artwork
    for (const artwork of this.artworks) {
      const distance = this.camera.position.distanceTo(artwork.mesh.position);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestArtwork = artwork;
      }
    }
    
    // If we're close enough to any artwork, show its info
    if (closestDistance < this.proximityDistance && closestArtwork) {
      this.showArtworkInfo(closestArtwork.info);
    } else if (!this.selectedArtwork) {
      this.hideArtworkInfo();
    }
  }
  
  // Update function called each frame
  update() {
    this.checkProximity();
  }
}