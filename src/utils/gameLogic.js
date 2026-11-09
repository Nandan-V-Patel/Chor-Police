/**
 * Game logic utilities for Chor Police.
 * Pure functions — no React dependency.
 */

/**
 * Calculate the number of Chors for a given player count.
 * Formula: C = min(N - 1, max(1, floor(N / 3)))
 * @param {number} totalPlayers
 * @returns {number}
 */
export function calculateChors(totalPlayers) {
  if (totalPlayers < 3) return 0;
  return Math.min(totalPlayers - 1, Math.max(1, Math.floor(totalPlayers / 3)));
}

/**
 * Check victory conditions.
 * @param {number} activeChors
 * @param {number} activePolice
 * @returns {{ finished: boolean, winner: 'chor' | 'police' | null, reason: string }}
 */
export function checkVictory(activeChors, activePolice) {
  // Police win: all Chors eliminated
  if (activeChors === 0) {
    return {
      finished: true,
      winner: 'police',
      reason: 'All Chors have been caught!',
    };
  }

  // Chor wins: Chors outnumber Police
  if (activeChors > activePolice) {
    return {
      finished: true,
      winner: 'chor',
      reason: 'The Chors have outnumbered the Police!',
    };
  }

  // Chor wins: 1v1 special case
  if (activeChors === 1 && activePolice === 1) {
    return {
      finished: true,
      winner: 'chor',
      reason: 'The final Chor escaped elimination!',
    };
  }

  // Game continues
  return { finished: false, winner: null, reason: '' };
}

/**
 * Count active players by role.
 * @param {Array<{role: string, isEliminated: boolean}>} players
 * @returns {{ activeChors: number, activePolice: number }}
 */
export function countActiveRoles(players) {
  let activeChors = 0;
  let activePolice = 0;

  for (const p of players) {
    if (!p.isEliminated) {
      if (p.role === 'chor') activeChors++;
      else if (p.role === 'police') activePolice++;
    }
  }

  return { activeChors, activePolice };
}

/**
 * Validate that a manual Chor count is valid.
 * @param {number} chorCount
 * @param {number} totalPlayers
 * @returns {boolean}
 */
export function isValidChorCount(chorCount, totalPlayers) {
  return (
    Number.isInteger(chorCount) &&
    chorCount >= 1 &&
    chorCount < totalPlayers &&
    totalPlayers - chorCount >= 1
  );
}

