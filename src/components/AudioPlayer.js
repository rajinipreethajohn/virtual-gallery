// AudioPlayer.js - Handles background music for the gallery

import * as THREE from 'three';

export class AudioPlayer {
  constructor(camera) {
    this.camera = camera;
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);
    
    this.sounds = {};
    this.currentTrack = null;
    this.volume = 0.5;
    this.muted = false;
    
    // Create audio controls UI
    this.createControls();
  }
  
  // Create audio control UI
  createControls() {
    // Create container
    const controls = document.createElement('div');
    controls.className = 'audio-controls';
    
    // Create play/pause button
    this.playButton = document.createElement('button');
    this.playButton.innerHTML = '&#10074;&#10074;'; // Pause symbol
    this.playButton.addEventListener('click', () => this.togglePlayPause());
    
    // Create mute button
    this.muteButton = document.createElement('button');
    this.muteButton.innerHTML = '&#128266;'; // Speaker symbol
    this.muteButton.addEventListener('click', () => this.toggleMute());
    
    // Create volume slider
    this.volumeSlider = document.createElement('input');
    this.volumeSlider.type = 'range';
    this.volumeSlider.min = 0;
    this.volumeSlider.max = 1;
    this.volumeSlider.step = 0.1;
    this.volumeSlider.value = this.volume;
    this.volumeSlider.className = 'volume-slider';
    this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
    
    // Create track info
    this.trackInfo = document.createElement('span');
    this.trackInfo.textContent = 'No track playing';
    
    // Add all elements to container
    controls.appendChild(this.playButton);
    controls.appendChild(this.muteButton);
    controls.appendChild(this.volumeSlider);
    controls.appendChild(this.trackInfo);
    
    // Add to DOM
    document.body.appendChild(controls);
  }
  
  // Load a sound track
  loadTrack(name, url) {
    return new Promise((resolve, reject) => {
      if (this.sounds[name]) {
        resolve(this.sounds[name]);
        return;
      }
      
      const sound = new THREE.Audio(this.listener);
      const audioLoader = new THREE.AudioLoader();
      
      audioLoader.load(
        url,
        (buffer) => {
          sound.setBuffer(buffer);
          sound.setLoop(true);
          sound.setVolume(this.volume);
          this.sounds[name] = sound;
          resolve(sound);
        },
        undefined,
        (error) => {
          console.error('Error loading audio track:', error);
          reject(error);
        }
      );
    });
  }
  
  // Play a specific track
  async playTrack(name, fadeTime = 1000) {
    if (!this.sounds[name]) {
      console.warn(`Track ${name} not loaded`);
      return;
    }
    
    // If there's already a track playing, fade it out
    if (this.currentTrack && this.sounds[this.currentTrack].isPlaying) {
      await this.fadeOut(this.currentTrack, fadeTime);
    }
    
    // Start the new track
    this.sounds[name].setVolume(0);
    this.sounds[name].play();
    this.currentTrack = name;
    
    // Update UI
    this.trackInfo.textContent = `Now playing: ${name}`;
    this.playButton.innerHTML = '&#10074;&#10074;'; // Pause symbol
    
    // Fade in
    await this.fadeIn(name, fadeTime);
  }
  
  // Fade in a track
  fadeIn(name, duration = 1000) {
    return new Promise(resolve => {
      const sound = this.sounds[name];
      if (!sound) return resolve();
      
      const startVolume = 0;
      const endVolume = this.muted ? 0 : this.volume;
      
      let startTime = performance.now();
      
      const updateVolume = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        sound.setVolume(startVolume + (endVolume - startVolume) * progress);
        
        if (progress < 1) {
          requestAnimationFrame(updateVolume);
        } else {
          resolve();
        }
      };
      
      updateVolume();
    });
  }
  
  // Fade out a track
  fadeOut(name, duration = 1000) {
    return new Promise(resolve => {
      const sound = this.sounds[name];
      if (!sound || !sound.isPlaying) return resolve();
      
      const startVolume = sound.getVolume();
      const endVolume = 0;
      
      let startTime = performance.now();
      
      const updateVolume = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        sound.setVolume(startVolume + (endVolume - startVolume) * progress);
        
        if (progress < 1) {
          requestAnimationFrame(updateVolume);
        } else {
          sound.pause();
          resolve();
        }
      };
      
      updateVolume();
    });
  }
  
  // Toggle current track play/pause
  togglePlayPause() {
    if (!this.currentTrack) return;
    
    const sound = this.sounds[this.currentTrack];
    
    if (sound.isPlaying) {
      sound.pause();
      this.playButton.innerHTML = '&#9658;'; // Play symbol
    } else {
      sound.play();
      this.playButton.innerHTML = '&#10074;&#10074;'; // Pause symbol
    }
  }
  
  // Toggle mute
  toggleMute() {
    this.muted = !this.muted;
    
    // Update UI
    this.muteButton.innerHTML = this.muted ? '&#128263;' : '&#128266;';
    
    // Update current track volume
    if (this.currentTrack) {
      this.sounds[this.currentTrack].setVolume(this.muted ? 0 : this.volume);
    }
  }
  
  // Set volume level
  setVolume(value) {
    this.volume = parseFloat(value);
    
    // Update current track if not muted
    if (this.currentTrack && !this.muted) {
      this.sounds[this.currentTrack].setVolume(this.volume);
    }
  }
  
  // Stop all sounds
  stopAll() {
    Object.values(this.sounds).forEach(sound => {
      if (sound.isPlaying) {
        sound.stop();
      }
    });
    this.currentTrack = null;
    this.trackInfo.textContent = 'No track playing';
    this.playButton.innerHTML = '&#9658;'; // Play symbol
  }
}