import * as THREE from "three";
import { loadingManager, camera } from "../utils/three-setup.js";
import { controls } from "./Controls.js";

function setupAudio() {
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader(loadingManager);

  audioLoader.load("/assets/audio/ambient_music.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);

    // Wait until loading screen is gone before adding the button
    const checkGalleryReady = setInterval(() => {
      const loadingScreen = document.getElementById("loading-screen");
      if (!loadingScreen || loadingScreen.style.display === "none") {
        clearInterval(checkGalleryReady);
        createAudioButton(sound);
      }
    }, 300);
  });
}

function createAudioButton(sound) {
  // Create the start button
  const startButton = document.createElement("button");
  startButton.id = "audio-start-button";
  startButton.textContent = "🔊 Begin Audio Journey";
  Object.assign(startButton.style, {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 20px",
    zIndex: "1000",
    cursor: "pointer",
    fontFamily: "Arial, sans-serif",
    border: "none",
    borderRadius: "5px",
    background: "#ffffff",
    color: "#000000",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
  });

  document.body.appendChild(startButton);

  const handleStartAudio = function (event) {
    event.preventDefault();
    event.stopPropagation();

    sound.play();
    // controls.lock();
    startButton.remove();

    // Add mute/unmute button after sound starts
    createMuteButton(sound);
  };

  startButton.addEventListener("touchstart", handleStartAudio, {
    passive: false,
  });
  startButton.addEventListener("click", handleStartAudio);
}

function createMuteButton(sound) {
  const muteButton = document.createElement("button");
  muteButton.textContent = "🔊 Audio On";
  Object.assign(muteButton.style, {
    position: "fixed",
    top: "24px",
    right: "20px",
    padding: "12px 18px",
    border: "none",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    fontFamily: "Nunito Sans, sans-serif",
    background: "rgba(255, 255, 255, 0.88)",
    color: "#111",
    zIndex: "9999",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
    pointerEvents: "auto",
    boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  });

  document.body.appendChild(muteButton);

  const handleMuteToggle = function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (sound.isPlaying) {
      sound.pause();
      muteButton.textContent = "🔇 Muted";
    } else {
      sound.play();
      muteButton.textContent = "🔊 Audio On";
    }
  };

  muteButton.addEventListener("touchstart", handleMuteToggle, {
    passive: false,
  });
  muteButton.addEventListener("click", handleMuteToggle);
}

export { setupAudio };
