import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Skull, Shield, Lock, CircleDot, Circle, Ban } from 'lucide-react';
import { countActiveRoles } from '../utils/gameLogic';
import ConfirmationModal from './ConfirmationModal';
import NewGameOptionsModal from './NewGameOptionsModal';

export default function GameScreen({
  players,
  selectedPlayerId,
  gameStatus,
  onSelectPlayer,
  onEliminatePlayer,
  onRestart,
  onBackToLobby,
}) {
  const [showVoteConfirm, setShowVoteConfirm] = useState(false);
  const [showNewGameOptions, setShowNewGameOptions] = useState(false);
  const [restartStep, setRestartStep] = useState(0); // 0: none, 1: first confirm, 2: second confirm
  const eliminatingRef = useRef(false);

  const { activeChors, activePolice } = countActiveRoles(players);
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
  const isGameOver = gameStatus !== 'ongoing';

  const handleVoteOut = () => {
    if (!selectedPlayer || selectedPlayer.isEliminated || isGameOver) return;
    setShowVoteConfirm(true);
  };

  const handleConfirmEliminate = () => {
    // Guard against double-clicks: use a ref that persists across the sync call
    if (eliminatingRef.current) return;
    eliminatingRef.current = true;
    setShowVoteConfirm(false);
    onEliminatePlayer(selectedPlayerId);
    // Reset after a tick to allow future eliminations
    setTimeout(() => {
      eliminatingRef.current = false;
    }, 100);
  };

  const handleRestartClick = () => {
    setShowNewGameOptions(true);
  };

  const handleStartNewGame = () => {
    setShowNewGameOptions(false);
    setRestartStep(1);
  };

  const handleRestartStep1Confirm = () => {
    setRestartStep(2);
  };

  const handleRestartStep2Confirm = () => {
    setRestartStep(0);
    onRestart();
  };

  const handleRestartCancel = () => {
    setRestartStep(0);
  };

  const handleRestartGoBack = () => {
    setRestartStep(1);
  };

  return (
    <div className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">
          <span className="text-red-500">CHOR</span>{' '}
          <span className="text-blue-500">POLICE</span>
        </h2>
        <p className="text-gray-500 text-sm mt-1">Select a player to vote out</p>
      </div>

      {/* Player List */}
      <div className="flex-1 space-y-2 mb-6">
        {players.map((player) => {
          const isSelected = selectedPlayerId === player.id;
          const isEliminated = player.isEliminated;
          const isChor = player.role === 'chor';

          return (
            <motion.button
              key={player.id}
              layout
              onClick={() => !isEliminated && !isGameOver && onSelectPlayer(player.id)}
              disabled={isEliminated || isGameOver}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                isEliminated
                  ? 'bg-gray-900/50 border-gray-800/50 opacity-60'
                  : isSelected
                  ? 'bg-gray-800 border-blue-500/50 ring-1 ring-blue-500/30'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
              } ${isEliminated || isGameOver ? 'cursor-not-allowed' : ''}`}
            >
              {/* Selection indicator */}
              <div className="flex-shrink-0">
                {isEliminated ? (
                  <Ban className="w-5 h-5 text-gray-600" />
                ) : isSelected ? (
                  <CircleDot className="w-5 h-5 text-blue-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-600" />
                )}
              </div>

              {/* Name */}
              <span
                className={`flex-1 font-medium truncate ${
                  isEliminated ? 'line-through text-gray-600' : 'text-white'
                }`}
              >
                {player.name}
              </span>

              {/* Role indicator */}
              <div className="flex-shrink-0">
                {isEliminated ? (
                  <span
                    className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isChor
                        ? 'bg-red-500/15 text-red-400'
                        : 'bg-blue-500/15 text-blue-400'
                    }`}
                  >
                    {isChor ? (
                      <Skull className="w-3.5 h-3.5" />
                    ) : (
                      <Shield className="w-3.5 h-3.5" />
                    )}
                    {isChor ? 'CHOR' : 'POLICE'}
                  </span>
                ) : (
                  <Lock className="w-4 h-4 text-gray-600" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Vote Out Button */}
      <button
        onClick={handleVoteOut}
        disabled={!selectedPlayer || selectedPlayer?.isEliminated || isGameOver}
        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all mb-6 cursor-pointer ${
          selectedPlayer && !selectedPlayer.isEliminated && !isGameOver
            ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
        }`}
      >
        VOTE OUT
      </button>

      {/* Game Status */}
      <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-4">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-3">
          Game Status
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-red-400">{activeChors}</p>
            <p className="text-red-400/60 text-xs mt-0.5">Chors Remaining</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-blue-400">{activePolice}</p>
            <p className="text-blue-400/60 text-xs mt-0.5">Police Remaining</p>
          </div>
        </div>
      </div>

      {/* New Game Button */}
      {!isGameOver && (
        <button
          onClick={handleRestartClick}
          className="text-gray-600 hover:text-gray-400 text-sm font-medium py-2 transition-colors cursor-pointer"
        >
          New Game
        </button>
      )}

      <NewGameOptionsModal
        isOpen={showNewGameOptions}
        onCancel={() => setShowNewGameOptions(false)}
        onBackToLobby={onBackToLobby}
        onStartNewGame={handleStartNewGame}
      />

      {/* Vote Out Confirmation */}
      <ConfirmationModal
        isOpen={showVoteConfirm}
        title="Vote Out Player"
        message={`Are you sure you want to vote ${selectedPlayer?.name || ''} out?`}
        cancelLabel="Cancel"
        confirmLabel="Confirm"
        confirmVariant="danger"
        onCancel={() => setShowVoteConfirm(false)}
        onConfirm={handleConfirmEliminate}
      />

      {/* Restart Step 1 */}
      <ConfirmationModal
        isOpen={restartStep === 1}
        title="Restart Game?"
        message="Are you sure you want to restart this game?"
        cancelLabel="Cancel"
        confirmLabel="Continue"
        confirmVariant="primary"
        onCancel={handleRestartCancel}
        onConfirm={handleRestartStep1Confirm}
      />

      {/* Restart Step 2 */}
      <ConfirmationModal
        isOpen={restartStep === 2}
        title="Confirm Restart"
        message="All current role assignments and elimination progress will be reset. Every player will receive a new randomly assigned role."
        cancelLabel="Go Back"
        confirmLabel="Confirm Restart"
        confirmVariant="danger"
        onCancel={handleRestartGoBack}
        onConfirm={handleRestartStep2Confirm}
      />
    </div>
  );
}
