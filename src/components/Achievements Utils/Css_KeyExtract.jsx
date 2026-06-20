// Returns an array of achievement titles unlocked based on the CSS code
export const checkCssAchievements = (cssCode) => {
  const achievements = [];

  // class usage
  if (/\.[a-zA-Z0-9_-]+/.test(cssCode)) {
    achievements.push("styleStrategist");
  }

  // ID usage
  if (/#\w+/.test(cssCode)) {
    achievements.push("selectorStrategist");
  }

  // color property
  if (/(color|background-color)\s*:\s*[^;]+;/.test(cssCode)) {
    achievements.push("colorCrafter");
  }

  // flex or grid layout
  if (/display\s*:\s*(flex|grid)/.test(cssCode)) {
    achievements.push("layoutLegend");
  }

  // box model usage
  if (/(margin|padding|border)\s*:\s*[^;]+;/.test(cssCode)) {
    achievements.push("boxBuilder");
  }

  // font styling
  if (/(font-size|font-family|font-weight)\s*:\s*[^;]+;/.test(cssCode)) {
    achievements.push("fontFanatic");
  }

  // transitions
if (/transition\s*:\s*[^;]+;/.test(cssCode)) {
  achievements.push("transitionTechnician");
}

  return achievements;
};
