// Controls.js - Handles user movement in the gallery

import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class GalleryControls {
  constructor(camera, domElement, roomDimensions) {
    // Store references
    this.camera = camera;
    this.domElement = domElement;
    this.roomDimensions = roomDimensions;
    
    // Create pointer lock controls
    this.pointerControls = new PointerLockControls(camera, domElement);
    
    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;
    
    // Physics
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.speedFactor = 20.0; // Movement speed
    this.jumpVelocity = 350;
    this.gravity = 30.0;
    
    // Walking height (eye level)
    this.playerHeight = 1.6;
    
    // Collision detection
    this.raycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      10
    );
    
    // Wall collision margin
    this.wallMargin = 0.5;
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Mobile controls for touch devices
    this.setupMobileControls();
  }
  
  // Setup keyboard and mouse event listeners
  setupEventListeners() {
    // Click event to request pointer lock
    this.domElement.addEventListener('click', () => {
      if (!this.pointerControls.isLocked) {
        this.pointerControls.lock();
      }
    });
    
    // Key down event
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = true;
          break;
          
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = true;
          break;
          
        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = true;
          break;
          
        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = true;
          break;
          
        case 'Space':
          if (this.canJump) {
            this.velocity.y = this.jumpVelocity;
          }
          this.canJump = false;
          break;
      }
    });
    
    // Key up event
    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = false;
          break;
          
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = false;
          break;
          
        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = false;
          break;
          
        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = false;
          break;
      }
    });
  }
  
  // Setup touch controls for mobile devices
  setupMobileControls() {
    // Only create if on touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      // Create container
      const mobileControls = document.createElement('div');
      mobileControls.className = 'mobile-controls';
      
      // Forward button
      const forwardBtn = document.createElement('button');
      forwardBtn.textContent = '↑';
      forwardBtn.addEventListener('touchstart', () => { this.moveForward = true; });
      forwardBtn.addEventListener('touchend', () => { this.moveForward = false; });
      
      // Left button
      const leftBtn = document.createElement('button');
      leftBtn.textContent = '←';
      leftBtn.addEventListener('touchstart', () => { this.moveLeft = true; });
      leftBtn.addEventListener('touchend', () => { this.moveLeft = false; });
      
      // Backward button
      const backwardBtn = document.createElement('button');
      backwardBtn.textContent = '↓';
      backwardBtn.addEventListener('touchstart', () => { this.moveBackward = true; });
      backwardBtn.addEventListener('touchend', () => { this.moveBackward = false; });
      
      // Right button
      const rightBtn = document.createElement('button');
      rightBtn.textContent = '→';
      rightBtn.addEventListener('touchstart', () => { this.moveRight = true; });
      rightBtn.addEventListener('touchend', () => { this.moveRight = false; });
      
      // Add buttons to container
      mobileControls.appendChild(leftBtn);
      mobileControls.appendChild(forwardBtn);
      mobileControls.appendChild(backwardBtn);
      mobileControls.appendChild(rightBtn);
      
      // Add to DOM
      document.body.appendChild(mobileControls);
      
      // Add touch joystick for looking around
      this.setupTouchJoystick();
    }
  }
  
  // Setup touch joystick for camera rotation on mobile
  setupTouchJoystick() {
    const joystickSize = 120;
    const joystickContainer = document.createElement('div');
    joystickContainer.style.position = 'fixed';
    joystickContainer.style.right = '20px';
    joystickContainer.style.bottom = '100px';
    joystickContainer.style.width = `${joystickSize}px`;
    joystickContainer.style.height = `${joystickSize}px`;
    joystickContainer.style.borderRadius = '50%';
    joystickContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    joystickContainer.style.border = '2px solid rgba(255, 255, 255, 0.5)';
    joystickContainer.style.display = 'flex';
    joystickContainer.style.alignItems = 'center';
    joystickContainer.style.justifyContent = 'center';
    
    const joystick = document.createElement('div');
    joystick.style.width = `${joystickSize / 2}px`;
    joystick.style.height = `${joystickSize / 2}px`;
    joystick.style.borderRadius = '50%';
    joystick.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    joystick.style.position = 'relative';
    
    joystickContainer.appendChild(joystick);
    document.body.appendChild(joystickContainer);
    
    let joystickActive = false;
    let centerX = 0;
    let centerY = 0;
    
    joystickContainer.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = joystickContainer.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
      joystickActive = true;
      updateJoystickPosition(touch);
    });
    
    document.addEventListener('touchmove', (e) => {
      if (joystickActive) {
        e.preventDefault();
        const touch = e.touches[0];
        updateJoystickPosition(touch);
      }
    });
    
    document.addEventListener('touchend', () => {
      if (joystickActive) {
        joystick.style.left = '0px';
        joystick.style.top = '0px';
        joystickActive = false;
      }
    });
    
    const updateJoystickPosition = (touch) => {
      const maxDistance = joystickSize / 3;
      
      let deltaX = touch.clientX - centerX;
      let deltaY = touch.clientY - centerY;
      
      // Calculate distance from center
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // If distance is greater than max, normalize
      if (distance > maxDistance) {
        deltaX = (deltaX / distance) * maxDistance;
        deltaY = (deltaY / distance) * maxDistance;
      }
      
      // Update joystick position
      joystick.style.left = `${deltaX}px`;
      joystick.style.top = `${deltaY}px`;
      
      // Rotate camera based on joystick position
      const rotationX = -deltaX / maxDistance * 0.05;
      const rotationY = -deltaY / maxDistance * 0.05;
      
      this.camera.rotation.y += rotationX;
      
      // Limit vertical rotation to prevent camera flipping
      const newXRotation = this.camera.rotation.x + rotationY;
      if (newXRotation < Math.PI / 2 && newXRotation > -Math.PI / 2) {
        this.camera.rotation.x = newXRotation;
      }
    };
  }
  
  // Update controls for animation frame
  update(delta) {
    if (this.pointerControls.isLocked) {
      // Apply friction to slow down movement
      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;
      this.velocity.y -= this.gravity * delta; // Apply gravity
      
      // Update direction vector based on key presses
      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize();
      
      // Apply direction to velocity
      if (this.moveForward || this.moveBackward) {
        this.velocity.z -= this.direction.z * this.speedFactor * delta;
      }
      if (this.moveLeft || this.moveRight) {
        this.velocity.x -= this.direction.x * this.speedFactor * delta;
      }
      
      // Apply movement with collision detection
      const oldPosition = this.camera.position.clone();
      
      // Move with velocity
      this.pointerControls.moveRight(-this.velocity.x * delta);
      this.pointerControls.moveForward(-this.velocity.z * delta);
      this.camera.position.y += this.velocity.y * delta;
      
      // Keep within room boundaries
      if (this.roomDimensions) {
        const { width, length, height } = this.roomDimensions;
        
        if (this.camera.position.x < -width/2 + this.wallMargin) {
          this.camera.position.x = -width/2 + this.wallMargin;
        }
        if (this.camera.position.x > width/2 - this.wallMargin) {
          this.camera.position.x = width/2 - this.wallMargin;
        }
        if (this.camera.position.z < -length/2 + this.wallMargin) {
          this.camera.position.z = -length/2 + this.wallMargin;
        }
        if (this.camera.position.z > length/2 - this.wallMargin) {
          this.camera.position.z = length/2 - this.wallMargin;
        }
        
        // Floor collision
        if (this.camera.position.y < this.playerHeight) {
          this.camera.position.y = this.playerHeight;
          this.velocity.y = 0;
          this.canJump = true;
        }
        
        // Ceiling collision
        if (this.camera.position.y > height - 0.1) {
          this.camera.position.y = height - 0.1;
          this.velocity.y = 0;
        }
      }
    }
  }
  
  // Get current position
  getPosition() {
    return this.camera.position.clone();
  }
  
  // Set position
  setPosition(x, y, z) {
    this.camera.position.set(x, y || this.playerHeight, z);
  }
  
  // Lock/unlock controls
  lock() {
    this.pointerControls.lock();
  }
  
  unlock() {
    this.pointerControls.unlock();
  }
  
  // Get whether controls are locked
  isLocked() {
    return this.pointerControls.isLocked;
  }
}