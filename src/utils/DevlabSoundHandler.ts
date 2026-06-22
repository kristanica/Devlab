const soundFiles: Record<string, string> = {
  correct: "/Sounds/correct.mp3",
  inCorrect: "/Sounds/inCorrect.mp3",
  success: "/Sounds/success.mp3",
  levelUp: "/Sounds/levelUp.mp3",
  achievementUnlock: "/Sounds/achievementUnlocked.mp3",
  purchase: "/Sounds/purchase.mp3",
};

const sounds: Record<string, HTMLAudioElement | null> = Object.fromEntries(
  Object.keys(soundFiles).map((key) => [key, null])
);

export const loadSounds = async (): Promise<void> => {
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

export const playSound = (soundName: string): void => {
  const sound = sounds[soundName];

  if (!sound) {
    console.warn(` DevLab: Sound "${soundName}" does not exist.`);
    return;
  }

  sound.currentTime = 0;

  sound.play().catch((err) => {
    console.warn(" Sound play blocked by browser", err);
  });
};

export const unloadSounds = (): void => {
  Object.keys(sounds).forEach((key) => {
    sounds[key] = null;
  });
  console.log(" DevLab sounds unloaded");
};
