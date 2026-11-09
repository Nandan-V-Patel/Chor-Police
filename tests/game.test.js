import { describe, it, expect, beforeEach } from 'vitest';
import { calculateChors, checkVictory, countActiveRoles, isValidChorCount } from '../src/utils/gameLogic';
import { assignRoles } from '../src/utils/roleAssignment';
import { saveGameState, loadGameState, clearGameState } from '../src/utils/persistence';
import { gameReducer } from '../src/hooks/useGameState';

// ═══════════════════════════════════════════
// 1. Automatic Chor Allocation Formula
// Formula: C = min(N - 1, max(1, floor(N / 3)))
// ═══════════════════════════════════════════
describe('Automatic Chor Allocation Formula', () => {
  it('0 players → 0 Chors', () => expect(calculateChors(0)).toBe(0));
  it('1 player → 0 Chors', () => expect(calculateChors(1)).toBe(0));
  it('2 players → 0 Chors', () => expect(calculateChors(2)).toBe(0));
  it('3 players → 1 Chor', () => expect(calculateChors(3)).toBe(1));
  it('4 players → 1 Chor', () => expect(calculateChors(4)).toBe(1));
  it('5 players → 1 Chor', () => expect(calculateChors(5)).toBe(1));
  it('6 players → 2 Chors', () => expect(calculateChors(6)).toBe(2));
  it('7 players → 2 Chors', () => expect(calculateChors(7)).toBe(2));
  it('8 players → 2 Chors', () => expect(calculateChors(8)).toBe(2));
  it('9 players → 3 Chors', () => expect(calculateChors(9)).toBe(3));
  it('10 players → 3 Chors', () => expect(calculateChors(10)).toBe(3));
  it('11 players → 3 Chors', () => expect(calculateChors(11)).toBe(3));
  it('12 players → 4 Chors', () => expect(calculateChors(12)).toBe(4));
  it('15 players → 5 Chors', () => expect(calculateChors(15)).toBe(5));
  it('20 players → 6 Chors', () => expect(calculateChors(20)).toBe(6));
});

// ═══════════════════════════════════════════
// 2. Role Assignment & Player Ordering
// ═══════════════════════════════════════════
describe('Role Assignment & Player Ordering', () => {
  const makePlayers = (names) =>
    names.map((name) => ({
      id: `id-${name.toLowerCase()}`,
      name,
    }));

  it('preserves exact registration order of players', () => {
    const input = makePlayers(['Nandan', 'Rahul', 'Karan', 'Aditya', 'Harsh', 'Pranav']);
    const assigned = assignRoles(input, 2);

    for (let i = 0; i < input.length; i++) {
      expect(assigned[i].name).toBe(input[i].name);
      expect(assigned[i].id).toBe(input[i].id);
    }
  });

  it('assigns exactly C Chors and N - C Police', () => {
    const input = makePlayers(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    const assigned = assignRoles(input, 2);

    const chors = assigned.filter((p) => p.role === 'chor');
    const police = assigned.filter((p) => p.role === 'police');

    expect(chors.length).toBe(2);
    expect(police.length).toBe(5);
  });

  it('every player has a valid role ("chor" or "police")', () => {
    const input = makePlayers(['A', 'B', 'C', 'D', 'E']);
    const assigned = assignRoles(input, 1);

    for (const p of assigned) {
      expect(['chor', 'police']).toContain(p.role);
    }
  });

  it('players start uneliminated with null eliminatedAt', () => {
    const input = makePlayers(['A', 'B', 'C']);
    const assigned = assignRoles(input, 1);

    for (const p of assigned) {
      expect(p.isEliminated).toBe(false);
      expect(p.eliminatedAt).toBeNull();
    }
  });

  it('unbiased Fisher-Yates distribution (over 1000 trials)', () => {
    // 3 players, 1 Chor. Each player should be Chor roughly ~33% of the time.
    const input = makePlayers(['A', 'B', 'C']);
    const counts = { A: 0, B: 0, C: 0 };
    const TRIALS = 3000;

    for (let i = 0; i < TRIALS; i++) {
      const assigned = assignRoles(input, 1);
      const chor = assigned.find((p) => p.role === 'chor');
      counts[chor.name]++;
    }

    // Expect each to be between 25% and 42% (33% ideal)
    for (const name of ['A', 'B', 'C']) {
      const freq = counts[name] / TRIALS;
      expect(freq).toBeGreaterThan(0.25);
      expect(freq).toBeLessThan(0.42);
    }
  });
});

// ═══════════════════════════════════════════
// 3. Victory Conditions (Audit Item 6 & 7)
// ═══════════════════════════════════════════
describe('Victory Conditions', () => {
  // Police victory: C = 0
  it('0 Chors, 3 Police → Police win', () => {
    const res = checkVictory(0, 3);
    expect(res.finished).toBe(true);
    expect(res.winner).toBe('police');
  });

  it('0 Chors, 1 Police → Police win', () => {
    const res = checkVictory(0, 1);
    expect(res.finished).toBe(true);
    expect(res.winner).toBe('police');
  });

  // Chor victory: C > P
  it('2 Chors, 1 Police → Chor wins (C > P)', () => {
    const res = checkVictory(2, 1);
    expect(res.finished).toBe(true);
    expect(res.winner).toBe('chor');
  });

  it('3 Chors, 2 Police → Chor wins (C > P)', () => {
    const res = checkVictory(3, 2);
    expect(res.finished).toBe(true);
    expect(res.winner).toBe('chor');
  });

  // Chor victory: 1v1 special exception (C = 1, P = 1)
  it('1 Chor, 1 Police → Chor wins (1v1 special case)', () => {
    const res = checkVictory(1, 1);
    expect(res.finished).toBe(true);
    expect(res.winner).toBe('chor');
    expect(res.reason).toContain('final Chor escaped');
  });

  // 2v2 MUST CONTINUE — NOT a victory (Audit Item 7)
  it('2 Chors, 2 Police → Continue (2v2 is NOT a win)', () => {
    const res = checkVictory(2, 2);
    expect(res.finished).toBe(false);
    expect(res.winner).toBeNull();
  });

  // Other continue cases
  it('1 Chor, 4 Police → Continue', () => {
    expect(checkVictory(1, 4).finished).toBe(false);
  });

  it('2 Chors, 4 Police → Continue', () => {
    expect(checkVictory(2, 4).finished).toBe(false);
  });

  it('2 Chors, 3 Police → Continue', () => {
    expect(checkVictory(2, 3).finished).toBe(false);
  });

  it('1 Chor, 2 Police → Continue', () => {
    expect(checkVictory(1, 2).finished).toBe(false);
  });
});

// ═══════════════════════════════════════════
// 4. Role Counting & Elimination (Audit Item 5 & 10)
// ═══════════════════════════════════════════
describe('Role Counting & Elimination', () => {
  it('correctly counts active Chors and Police', () => {
    const players = [
      { role: 'chor', isEliminated: false },
      { role: 'chor', isEliminated: true },
      { role: 'police', isEliminated: false },
      { role: 'police', isEliminated: false },
      { role: 'police', isEliminated: true },
    ];
    const { activeChors, activePolice } = countActiveRoles(players);
    expect(activeChors).toBe(1);
    expect(activePolice).toBe(2);
  });

  it('counts do not include eliminated players', () => {
    const players = [
      { role: 'chor', isEliminated: true },
      { role: 'chor', isEliminated: true },
      { role: 'police', isEliminated: true },
    ];
    const { activeChors, activePolice } = countActiveRoles(players);
    expect(activeChors).toBe(0);
    expect(activePolice).toBe(0);
  });

  it('elimination of a Chor reduces activeChors by 1', () => {
    const players = [
      { id: '1', role: 'chor', isEliminated: false },
      { id: '2', role: 'police', isEliminated: false },
    ];

    const before = countActiveRoles(players);
    const after = countActiveRoles(
      players.map((p) => (p.id === '1' ? { ...p, isEliminated: true } : p))
    );

    expect(before.activeChors).toBe(1);
    expect(after.activeChors).toBe(0);
  });

  it('elimination of a Police reduces activePolice by 1', () => {
    const players = [
      { id: '1', role: 'chor', isEliminated: false },
      { id: '2', role: 'police', isEliminated: false },
    ];

    const before = countActiveRoles(players);
    const after = countActiveRoles(
      players.map((p) => (p.id === '2' ? { ...p, isEliminated: true } : p))
    );

    expect(before.activePolice).toBe(1);
    expect(after.activePolice).toBe(0);
  });
});

describe('Reducer transition guards', () => {
  const gameState = {
    players: [
      { id: 'c1', name: 'A', role: 'chor', isEliminated: false, eliminatedAt: null },
      { id: 'p1', name: 'B', role: 'police', isEliminated: false, eliminatedAt: null },
      { id: 'p2', name: 'C', role: 'police', isEliminated: false, eliminatedAt: null },
    ],
    totalPlayers: 3,
    allocationMode: 'automatic',
    configuredChors: 1,
    currentRevealIndex: 0,
    revealedPlayers: {},
    selectedPlayerId: null,
    gamePhase: 'game',
    gameStatus: 'ongoing',
    eliminationHistory: [],
    victoryReason: '',
  };

  it('ignores elimination and selection outside active gameplay', () => {
    const revealState = { ...gameState, gamePhase: 'reveal' };
    expect(gameReducer(revealState, { type: 'ELIMINATE_PLAYER', payload: 'c1' })).toBe(revealState);
    expect(gameReducer(revealState, { type: 'SELECT_PLAYER', payload: 'c1' })).toBe(revealState);
  });

  it('records an elimination only once and ignores repeats', () => {
    const eliminated = gameReducer(gameState, { type: 'ELIMINATE_PLAYER', payload: 'p1' });
    expect(eliminated.players.find((p) => p.id === 'p1').isEliminated).toBe(true);
    expect(eliminated.eliminationHistory).toHaveLength(1);
    expect(gameReducer(eliminated, { type: 'ELIMINATE_PLAYER', payload: 'p1' })).toBe(eliminated);
  });

  it('requires the current player to reveal before advancing', () => {
    const revealState = { ...gameState, gamePhase: 'reveal' };
    expect(gameReducer(revealState, { type: 'NEXT_REVEAL' })).toBe(revealState);
    const marked = gameReducer(revealState, { type: 'MARK_REVEALED', payload: 'p1' });
    expect(marked).toBe(revealState);
    const currentMarked = gameReducer(revealState, { type: 'MARK_REVEALED', payload: 'c1' });
    expect(gameReducer(currentMarked, { type: 'NEXT_REVEAL' }).currentRevealIndex).toBe(1);
  });

  it('returns to the lobby with the roster intact and roles reset', () => {
    const eliminatedState = {
      ...gameState,
      players: gameState.players.map((player) =>
        player.id === 'p1' ? { ...player, isEliminated: true, eliminatedAt: 123 } : player
      ),
      gamePhase: 'victory',
      gameStatus: 'chor_win',
      eliminationHistory: [{ playerId: 'p1', eliminatedAt: 123 }],
      victoryReason: 'The Chors have outnumbered the Police!',
    };
    const lobby = gameReducer(eliminatedState, { type: 'RETURN_TO_LOBBY' });
    expect(lobby.gamePhase).toBe('lobby');
    expect(lobby.players.map(({ id, name }) => ({ id, name }))).toEqual(
      gameState.players.map(({ id, name }) => ({ id, name }))
    );
    expect(lobby.players.every((player) => !('role' in player))).toBe(true);
    expect(lobby.eliminationHistory).toEqual([]);
    expect(gameReducer(lobby, { type: 'ADD_PLAYER', payload: 'D' }).players).toHaveLength(4);
  });

  it('confirms a refresh into an empty lobby without restoring names', () => {
    const reset = gameReducer(gameState, { type: 'RESET_TO_EMPTY_LOBBY' });
    expect(reset.gamePhase).toBe('lobby');
    expect(reset.players).toEqual([]);
    expect(reset.totalPlayers).toBe(0);
    expect(reset.gameStatus).toBe('ongoing');
  });
});

// ═══════════════════════════════════════════
// 5. Manual Chor Allocation Validation
// ═══════════════════════════════════════════
describe('Manual Chor Allocation Validation', () => {
  it('requires at least 1 Chor', () => {
    expect(isValidChorCount(0, 5)).toBe(false);
  });

  it('requires at least 1 Police (chorCount < totalPlayers)', () => {
    expect(isValidChorCount(5, 5)).toBe(false);
    expect(isValidChorCount(6, 5)).toBe(false);
  });

  it('accepts valid counts', () => {
    expect(isValidChorCount(1, 3)).toBe(true);
    expect(isValidChorCount(2, 4)).toBe(true);
    expect(isValidChorCount(3, 5)).toBe(true);
  });

  it('rejects floats', () => {
    expect(isValidChorCount(1.5, 4)).toBe(false);
  });
});

// ═══════════════════════════════════════════
// 6. Persistence & Restoration (Audit Item 9)
// ═══════════════════════════════════════════
describe('localStorage Persistence', () => {
  const store = {};

  beforeEach(() => {
    globalThis.localStorage = {
      getItem: (key) => store[key] ?? null,
      setItem: (key, val) => { store[key] = String(val); },
      removeItem: (key) => { delete store[key]; },
    };
    clearGameState();
  });

  it('round-trips full game state', () => {
    const state = {
      players: [
        { id: 'p1', name: 'Alice', role: 'chor', isEliminated: false, eliminatedAt: null },
        { id: 'p2', name: 'Bob', role: 'police', isEliminated: false, eliminatedAt: null },
        { id: 'p3', name: 'Charlie', role: 'police', isEliminated: false, eliminatedAt: null },
      ],
      totalPlayers: 3,
      allocationMode: 'automatic',
      configuredChors: 1,
      currentRevealIndex: 1,
      revealedPlayers: { p1: true },
      selectedPlayerId: 'p2',
      gamePhase: 'reveal',
      gameStatus: 'ongoing',
      eliminationHistory: [],
      victoryReason: '',
    };

    saveGameState(state);
    const restored = loadGameState();

    expect(restored).not.toBeNull();
    expect(restored.players.length).toBe(3);
    expect(restored.currentRevealIndex).toBe(1);
    expect(restored.revealedPlayers.p1).toBe(true);
  });

  it('handles corrupted JSON gracefully', () => {
    store['chor-police-game-state'] = '{corrupt';
    expect(loadGameState()).toBeNull();
  });

  it('handles invalid phase gracefully', () => {
    store['chor-police-game-state'] = JSON.stringify({
      players: [],
      gamePhase: 'hacked_phase',
    });
    expect(loadGameState()).toBeNull();
  });

  it('resets out-of-bounds currentRevealIndex', () => {
    store['chor-police-game-state'] = JSON.stringify({
      players: [
        { id: '1', name: 'A', role: 'chor', isEliminated: false, eliminatedAt: null },
        { id: '2', name: 'B', role: 'police', isEliminated: false, eliminatedAt: null },
        { id: '3', name: 'C', role: 'police', isEliminated: false, eliminatedAt: null },
      ],
      gamePhase: 'reveal',
      totalPlayers: 3,
      allocationMode: 'automatic',
      configuredChors: 1,
      currentRevealIndex: 99,
      revealedPlayers: {},
      gameStatus: 'ongoing',
      eliminationHistory: [],
    });
    const loaded = loadGameState();
    expect(loaded.currentRevealIndex).toBe(0);
  });
});
