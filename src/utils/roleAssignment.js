/**
 * Role assignment using Fisher-Yates shuffle.
 * Pure functions — no React dependency.
 */

/**
 * Fisher-Yates (Knuth) shuffle — in-place, unbiased.
 * @param {Array} array - Array to shuffle (mutated).
 * @returns {Array} The same array, shuffled.
 */
export function fisherYatesShuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Assign roles to players.
 * Returns a new array with role property set — does NOT mutate the input.
 * Preserves original player order.
 *
 * @param {Array<{id: string, name: string}>} players
 * @param {number} chorCount - How many Chors to assign.
 * @returns {Array<{id: string, name: string, role: 'chor'|'police', isEliminated: boolean, eliminatedAt: number|null}>}
 */
export function assignRoles(players, chorCount) {
  if (chorCount < 1 || chorCount >= players.length) {
    throw new Error(
      `Invalid chorCount ${chorCount} for ${players.length} players`
    );
  }

  // Create an array of indices and shuffle them
  const indices = players.map((_, i) => i);
  fisherYatesShuffle(indices);

  // The first `chorCount` shuffled indices become Chors
  const chorIndices = new Set(indices.slice(0, chorCount));

  // Map original players (preserving order) with assigned roles
  return players.map((player, i) => ({
    id: player.id,
    name: player.name,
    role: chorIndices.has(i) ? 'chor' : 'police',
    isEliminated: false,
    eliminatedAt: null,
  }));
}

/**
 * Generate a unique ID.
 * @returns {string}
 */
export function generateId() {
  return (
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).substring(2, 9)
  );
}

