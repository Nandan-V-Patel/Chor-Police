import { useReducer, useEffect, useCallback, useState } from 'react';
import { calculateChors, checkVictory, countActiveRoles, isValidChorCount } from '../utils/gameLogic';
import { assignRoles, generateId } from '../utils/roleAssignment';
import { saveGameState, loadGameState, clearGameState } from '../utils/persistence';

// ──────────────────────────────────────────
// Initial State
// ──────────────────────────────────────────
const defaultState = {
  players: [],
  totalPlayers: 0,
  allocationMode: 'automatic',
  configuredChors: 1,
  currentRevealIndex: 0,
  revealedPlayers: {},      // { [playerId]: true } — tracks who has revealed
  selectedPlayerId: null,
  gamePhase: 'home',        // home | lobby | config | reveal | game | victory
  gameStatus: 'ongoing',    // ongoing | police_win | chor_win
  eliminationHistory: [],
  victoryReason: '',
};

function getInitialState() {
  const saved = loadGameState();
  if (saved) {
    // Validate selectedPlayerId on restore: clear it if the player doesn't exist or is eliminated
    let validSelectedId = saved.selectedPlayerId;
    if (validSelectedId) {
      const selected = saved.players?.find((p) => p.id === validSelectedId);
      if (!selected || selected.isEliminated) {
        validSelectedId = null;
      }
    }

    return {
      ...defaultState,
      ...saved,
      selectedPlayerId: validSelectedId,
      revealedPlayers: saved.revealedPlayers || {},
    };
  }
  return { ...defaultState };
}

// ──────────────────────────────────────────
// Reducer
// ──────────────────────────────────────────
export function gameReducer(state, action) {
  switch (action.type) {
    // ── Navigation ──
    case 'GO_HOME':
      return { ...defaultState };

    case 'GO_LOBBY':
      if (!['home', 'config'].includes(state.gamePhase)) return state;
      return { ...state, gamePhase: 'lobby' };

    case 'GO_CONFIG':
      if (state.gamePhase !== 'lobby' || state.players.length < 3) return state;
      return { ...state, gamePhase: 'config' };

    case 'RETURN_TO_LOBBY': {
      if (!['game', 'victory'].includes(state.gamePhase)) return state;
      return {
        ...state,
        players: state.players.map(({ id, name }) => ({ id, name })),
        currentRevealIndex: 0,
        revealedPlayers: {},
        selectedPlayerId: null,
        gamePhase: 'lobby',
        gameStatus: 'ongoing',
        eliminationHistory: [],
        victoryReason: '',
      };
    }

    case 'RESET_TO_EMPTY_LOBBY':
      return {
        ...defaultState,
        gamePhase: 'lobby',
      };

    // ── Player Management ──
    case 'ADD_PLAYER': {
      if (state.gamePhase !== 'lobby') return state;
      const name = action.payload.trim();
      if (!name) return state;

      // Defense-in-depth: prevent duplicate names (case-insensitive)
      const duplicate = state.players.some(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );
      if (duplicate) return state;

      const newPlayer = { id: generateId(), name };
      const players = [...state.players, newPlayer];
      return {
        ...state,
        players,
        totalPlayers: players.length,
      };
    }

    case 'REMOVE_PLAYER': {
      if (state.gamePhase !== 'lobby') return state;
      const players = state.players.filter((p) => p.id !== action.payload);
      const totalPlayers = players.length;
      // Adjust configured chors if it becomes invalid
      let configuredChors = state.configuredChors;
      if (state.allocationMode === 'manual') {
        if (configuredChors >= totalPlayers) {
          configuredChors = Math.max(1, totalPlayers - 1);
        }
      }
      return {
        ...state,
        players,
        totalPlayers,
        configuredChors,
      };
    }

    // ── Allocation Config ──
    case 'SET_ALLOCATION_MODE':
      if (state.gamePhase !== 'config' || !['automatic', 'manual'].includes(action.payload)) return state;
      return { ...state, allocationMode: action.payload };

    case 'SET_CONFIGURED_CHORS': {
      if (state.gamePhase !== 'config') return state;
      const val = action.payload;
      if (isValidChorCount(val, state.totalPlayers)) {
        return { ...state, configuredChors: val };
      }
      return state;
    }

    // ── Start Game (assign roles → go to reveal) ──
    case 'START_GAME': {
      if (state.gamePhase !== 'config' || state.players.length < 3) return state;
      const chorCount =
        state.allocationMode === 'automatic'
          ? calculateChors(state.totalPlayers)
          : state.configuredChors;

      if (!isValidChorCount(chorCount, state.players.length)) return state;

      // Build minimal player objects for assignment
      const basePlayers = state.players.map((p) => ({
        id: p.id,
        name: p.name,
      }));

      const assigned = assignRoles(basePlayers, chorCount);

      return {
        ...state,
        players: assigned,
        configuredChors: chorCount,
        currentRevealIndex: 0,
        revealedPlayers: {},
        selectedPlayerId: null,
        gamePhase: 'reveal',
        gameStatus: 'ongoing',
        eliminationHistory: [],
        victoryReason: '',
      };
    }

    // ── Role Reveal ──
    case 'MARK_REVEALED': {
      const currentPlayer = state.players[state.currentRevealIndex];
      if (state.gamePhase !== 'reveal' || currentPlayer?.id !== action.payload) return state;
      return {
        ...state,
        revealedPlayers: {
          ...state.revealedPlayers,
          [action.payload]: true,
        },
      };
    }

    case 'NEXT_REVEAL': {
      const currentPlayer = state.players[state.currentRevealIndex];
      if (
        state.gamePhase !== 'reveal' ||
        !currentPlayer ||
        !state.revealedPlayers[currentPlayer.id]
      ) return state;
      const next = state.currentRevealIndex + 1;
      if (next >= state.totalPlayers) {
        return { ...state, gamePhase: 'game' };
      }
      return { ...state, currentRevealIndex: next };
    }

    case 'FINISH_REVEAL':
      if (
        state.gamePhase !== 'reveal' ||
        !state.players.length ||
        state.players.some((player) => !state.revealedPlayers[player.id])
      ) return state;
      return { ...state, gamePhase: 'game' };

    // ── Gameplay ──
    case 'SELECT_PLAYER': {
      if (state.gamePhase !== 'game' || state.gameStatus !== 'ongoing') return state;
      const player = state.players.find((p) => p.id === action.payload);
      if (!player || player.isEliminated) return state;
      return {
        ...state,
        selectedPlayerId:
          state.selectedPlayerId === action.payload ? null : action.payload,
      };
    }

    case 'ELIMINATE_PLAYER': {
      if (state.gamePhase !== 'game' || state.gameStatus !== 'ongoing') return state;
      const pid = action.payload;
      const playerIdx = state.players.findIndex((p) => p.id === pid);
      if (playerIdx === -1) return state;
      if (state.players[playerIdx].isEliminated) return state;

      const updatedPlayers = state.players.map((p) =>
        p.id === pid
          ? { ...p, isEliminated: true, eliminatedAt: Date.now() }
          : p
      );

      const { activeChors, activePolice } = countActiveRoles(updatedPlayers);
      const victory = checkVictory(activeChors, activePolice);

      return {
        ...state,
        players: updatedPlayers,
        selectedPlayerId: null,
        eliminationHistory: [
          ...state.eliminationHistory,
          { playerId: pid, eliminatedAt: Date.now() },
        ],
        gameStatus: victory.finished
          ? victory.winner === 'police'
            ? 'police_win'
            : 'chor_win'
          : 'ongoing',
        gamePhase: victory.finished ? 'victory' : 'game',
        victoryReason: victory.reason,
      };
    }

    // ── Restart ──
    case 'RESTART_GAME': {
      if (state.gamePhase !== 'game' || state.players.length < 3) return state;
      // Preserve players, allocation mode, and configured chors
      const chorCount =
        state.allocationMode === 'automatic'
          ? calculateChors(state.totalPlayers)
          : state.configuredChors;

      if (!isValidChorCount(chorCount, state.players.length)) return state;

      const basePlayers = state.players.map((p) => ({
        id: p.id,
        name: p.name,
      }));

      const assigned = assignRoles(basePlayers, chorCount);

      return {
        ...state,
        players: assigned,
        configuredChors: chorCount,
        currentRevealIndex: 0,
        revealedPlayers: {},
        selectedPlayerId: null,
        gamePhase: 'reveal',
        gameStatus: 'ongoing',
        eliminationHistory: [],
        victoryReason: '',
      };
    }

    case 'NEW_GAME_FROM_VICTORY': {
      if (state.gamePhase !== 'victory' || state.players.length < 3) return state;
      const chorCount =
        state.allocationMode === 'automatic'
          ? calculateChors(state.totalPlayers)
          : state.configuredChors;

      if (!isValidChorCount(chorCount, state.players.length)) return state;

      const basePlayers = state.players.map((p) => ({
        id: p.id,
        name: p.name,
      }));

      const assigned = assignRoles(basePlayers, chorCount);

      return {
        ...state,
        players: assigned,
        configuredChors: chorCount,
        currentRevealIndex: 0,
        revealedPlayers: {},
        selectedPlayerId: null,
        gamePhase: 'reveal',
        gameStatus: 'ongoing',
        eliminationHistory: [],
        victoryReason: '',
      };
    }

    default:
      return state;
  }
}

// ──────────────────────────────────────────
// Hook
// ──────────────────────────────────────────
export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, undefined, getInitialState);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(() => {
    if (typeof window === 'undefined' || !window.performance?.getEntriesByType) return false;
    return window.performance.getEntriesByType('navigation')[0]?.type === 'reload';
  });

  // Persist on every state change
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  // Convenience dispatchers
  const goHome = useCallback(() => {
    clearGameState();
    dispatch({ type: 'GO_HOME' });
  }, []);

  const goLobby = useCallback(() => dispatch({ type: 'GO_LOBBY' }), []);
  const goConfig = useCallback(() => dispatch({ type: 'GO_CONFIG' }), []);
  const returnToLobby = useCallback(() => dispatch({ type: 'RETURN_TO_LOBBY' }), []);
  const confirmRefreshToLobby = useCallback(() => {
    clearGameState();
    dispatch({ type: 'RESET_TO_EMPTY_LOBBY' });
    setShowRefreshConfirm(false);
  }, []);
  const cancelRefreshConfirm = useCallback(() => setShowRefreshConfirm(false), []);

  const addPlayer = useCallback(
    (name) => dispatch({ type: 'ADD_PLAYER', payload: name }),
    []
  );

  const removePlayer = useCallback(
    (id) => dispatch({ type: 'REMOVE_PLAYER', payload: id }),
    []
  );

  const setAllocationMode = useCallback(
    (mode) => dispatch({ type: 'SET_ALLOCATION_MODE', payload: mode }),
    []
  );

  const setConfiguredChors = useCallback(
    (count) => dispatch({ type: 'SET_CONFIGURED_CHORS', payload: count }),
    []
  );

  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), []);

  const markRevealed = useCallback(
    (playerId) => dispatch({ type: 'MARK_REVEALED', payload: playerId }),
    []
  );

  const nextReveal = useCallback(() => dispatch({ type: 'NEXT_REVEAL' }), []);
  const finishReveal = useCallback(() => dispatch({ type: 'FINISH_REVEAL' }), []);

  const selectPlayer = useCallback(
    (id) => dispatch({ type: 'SELECT_PLAYER', payload: id }),
    []
  );

  const eliminatePlayer = useCallback(
    (id) => dispatch({ type: 'ELIMINATE_PLAYER', payload: id }),
    []
  );

  const restartGame = useCallback(
    () => dispatch({ type: 'RESTART_GAME' }),
    []
  );

  const newGameFromVictory = useCallback(
    () => dispatch({ type: 'NEW_GAME_FROM_VICTORY' }),
    []
  );

  return {
    state,
    goHome,
    goLobby,
    goConfig,
    returnToLobby,
    showRefreshConfirm,
    confirmRefreshToLobby,
    cancelRefreshConfirm,
    addPlayer,
    removePlayer,
    setAllocationMode,
    setConfiguredChors,
    startGame,
    markRevealed,
    nextReveal,
    finishReveal,
    selectPlayer,
    eliminatePlayer,
    restartGame,
    newGameFromVictory,
  };
}
