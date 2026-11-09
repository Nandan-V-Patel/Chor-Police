/**
 * localStorage persistence utilities.
 */

const STORAGE_KEY = 'chor-police-game-state';

/**
 * Save game state to localStorage.
 * @param {object} state
 */
export function saveGameState(state) {
  try {
    // Don't persist transient UI state
    const serialisable = {
      players: state.players,
      totalPlayers: state.totalPlayers,
      allocationMode: state.allocationMode,
      configuredChors: state.configuredChors,
      currentRevealIndex: state.currentRevealIndex,
      revealedPlayers: state.revealedPlayers,
      selectedPlayerId: state.selectedPlayerId,
      gamePhase: state.gamePhase,
      gameStatus: state.gameStatus,
      eliminationHistory: state.eliminationHistory,
      victoryReason: state.victoryReason,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialisable));
  } catch {
    // Silently ignore write failures (e.g. quota exceeded)
  }
}

/**
 * Load game state from localStorage.
 * @returns {object|null} The restored state, or null if nothing valid is stored.
 */
export function loadGameState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    // Validate essential fields
    if (!Array.isArray(parsed.players)) return null;
    if (typeof parsed.gamePhase !== 'string') return null;

    // Validate each player object
    const playerIds = new Set();
    for (const p of parsed.players) {
      if (
        !p ||
        typeof p.id !== 'string' ||
        !p.id ||
        playerIds.has(p.id) ||
        typeof p.name !== 'string' ||
        (p.role !== 'chor' && p.role !== 'police' && p.role !== null && p.role !== undefined)
      ) {
        return null;
      }
      playerIds.add(p.id);
    }

    // Validate gamePhase
    const validPhases = ['home', 'lobby', 'config', 'reveal', 'game', 'victory'];
    if (!validPhases.includes(parsed.gamePhase)) return null;

    if (
      !Number.isInteger(parsed.totalPlayers) ||
      parsed.totalPlayers !== parsed.players.length ||
      !['automatic', 'manual'].includes(parsed.allocationMode) ||
      !Number.isInteger(parsed.configuredChors) ||
      !Number.isInteger(parsed.currentRevealIndex) ||
      !['ongoing', 'police_win', 'chor_win'].includes(parsed.gameStatus) ||
      !Array.isArray(parsed.eliminationHistory) ||
      !parsed.revealedPlayers || typeof parsed.revealedPlayers !== 'object' ||
      Array.isArray(parsed.revealedPlayers)
    ) return null;

    const isStarted = ['reveal', 'game', 'victory'].includes(parsed.gamePhase);
    if (isStarted && parsed.players.some((p) =>
      !['chor', 'police'].includes(p.role) || typeof p.isEliminated !== 'boolean'
    )) return null;

    if (
      (parsed.gamePhase === 'victory') !== (parsed.gameStatus !== 'ongoing') ||
      (parsed.gamePhase === 'reveal' && parsed.gameStatus !== 'ongoing') ||
      (parsed.gamePhase === 'game' && parsed.gameStatus !== 'ongoing')
    ) return null;

    if (
      !parsed.players.every((p) => !p.isEliminated || typeof p.eliminatedAt === 'number' || p.eliminatedAt === null) ||
      !Object.entries(parsed.revealedPlayers).every(([id, value]) => playerIds.has(id) && value === true) ||
      !parsed.eliminationHistory.every((entry) =>
        entry && playerIds.has(entry.playerId) && typeof entry.eliminatedAt === 'number'
      )
    ) return null;

    // If we're in reveal phase, ensure the card starts concealed
    // (no transient state to worry about since we don't persist hold state)

    // Validate currentRevealIndex
    if (
      typeof parsed.currentRevealIndex === 'number' &&
      (parsed.currentRevealIndex < 0 ||
        parsed.currentRevealIndex >= parsed.players.length)
    ) {
      parsed.currentRevealIndex = 0;
    }

    return parsed;
  } catch {
    // Corrupted data — clear and start fresh
    clearGameState();
    return null;
  }
}

/**
 * Clear saved game state.
 */
export function clearGameState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
