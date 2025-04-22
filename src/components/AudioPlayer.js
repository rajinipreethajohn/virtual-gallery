import * as THREE from 'three';
import { camera } from '../utils/three-setup.js';
import { controls } from './Controls.js';

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

export { setupAudio };
