// Precompute cumulative thresholds for up to level 1100
// Index l is the cumulative XP needed to REACH level l.
// Level 1: requires 0 cumulative XP
// Level 2: requires cumulative XP needed for level 1 (1000)
// Level 3: requires level 2 threshold + level 2 required XP, etc.
export const cumulativeXpThresholds: number[] = [0]; // index 0 is dummy, index 1 is level 1 = 0 XP

// Generate thresholds
const buildThresholds = () => {
  let accumulated = 0;
  cumulativeXpThresholds.push(0); // Level 1 cumulative XP is 0

  for (let lvl = 1; lvl <= 1100; lvl++) {
    let req = 1000;
    if (lvl <= 100) {
      // Linear scaling between level 1 (1,000 XP) and level 100 (25,000 XP)
      req = Math.round(1000 + (lvl - 1) * (24000 / 99));
    } else {
      // Scales smoothly past level 100 upwards to level 1000
      const diff = lvl - 100;
      req = Math.round(25000 + diff * 500 + Math.pow(diff, 1.4) * 8);
    }
    accumulated += req;
    cumulativeXpThresholds.push(accumulated);
  }
};

buildThresholds();

/**
 * Gets the XP required to level up *from* the given level to next.
 */
export function getRequiredXPForLevel(lvl: number): number {
  if (lvl <= 100) {
    return Math.round(1000 + (lvl - 1) * (24000 / 99));
  } else {
    const diff = lvl - 100;
    return Math.round(25000 + diff * 500 + Math.pow(diff, 1.4) * 8);
  }
}

/**
 * Calculates current level and progress from total accumulated XP
 */
export function getLevelAndProgress(xp: number): { level: number; progressPercent: number; xpInCurrentLevel: number; xpNeededInCurrentLevel: number } {
  let level = 1;
  while (level < 1000 && xp >= cumulativeXpThresholds[level + 1]) {
    level++;
  }

  const currentLevelStartXP = cumulativeXpThresholds[level];
  const nextLevelXPThreshold = cumulativeXpThresholds[level + 1];
  const reqXPThisLevel = nextLevelXPThreshold - currentLevelStartXP;
  const xpInCurrentLevel = xp - currentLevelStartXP;

  const progressPercent = reqXPThisLevel <= 0 
    ? 100 
    : Math.max(0, Math.min(100, (xpInCurrentLevel / reqXPThisLevel) * 100));

  return {
    level,
    progressPercent,
    xpInCurrentLevel,
    xpNeededInCurrentLevel: reqXPThisLevel
  };
}
