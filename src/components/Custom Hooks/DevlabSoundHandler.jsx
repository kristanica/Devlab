
// Import sound files
const soundFiles = {
  correct: "/Sounds/correct.mp3",
  inCorrect: "/Sounds/inCorrect.mp3",
  success: "/Sounds/success.mp3",
  levelUp: "/Sounds/levelUp.mp3",
  achievementUnlock: "/Sounds/achievementUnlocked.mp3",
  purchase: "/Sounds/purchase.mp3",
};


// Store Audio() instances here
const sounds = Object.fromEntries(
  Object.keys(soundFiles).map((key) => [key, null])
);

//  Load all sounds (preload for fast playback)
export const loadSounds = async () => {
  try {
    Object.entries(soundFiles).forEach(([key, file]) => {
      const audio = new Audio(file);
      audio.preload = "auto";
      sounds[key] = audio;
    });

    
  } catch (err) {
    console.error(" Error loading sounds:", err);
  }
};

//  Play a sound
export const playSound = (soundName) => {
  const sound = sounds[soundName];

  if (!sound) {
    console.warn(` DevLab: Sound "${soundName}" does not exist.`);
    return;
  }

  // Restart playback from start
  sound.currentTime = 0;

  // Some browsers require user interaction
  sound.play().catch((err) => {
    console.warn(" Sound play blocked by browser", err);
  });
};

// . Unload all sounds (optional)
export const unloadSounds = () => {
  Object.keys(sounds).forEach((key) => {
    sounds[key] = null;
  });
  console.log(" DevLab sounds unloaded");
};
