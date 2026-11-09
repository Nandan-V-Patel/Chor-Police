import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Skull, Shield, EyeOff, ArrowRight, Play } from 'lucide-react';

export default function RoleReveal({
  players,
  currentRevealIndex,
  revealedPlayers,
  onMarkRevealed,
  onNextReveal,
  onFinishReveal,
}) {
  const [holdingRevealIndex, setHoldingRevealIndex] = useState(null);
  const isHolding = holdingRevealIndex === currentRevealIndex;

  const currentPlayer = players[currentRevealIndex];
  const isLastPlayer = currentRevealIndex === players.length - 1;
  const hasRevealed = currentPlayer && revealedPlayers[currentPlayer.id];

  const handlePointerDown = useCallback(
    (e) => {
      e.preventDefault();
      setHoldingRevealIndex(currentRevealIndex);
      if (currentPlayer) {
        onMarkRevealed(currentPlayer.id);
      }
    },
    [currentPlayer, currentRevealIndex, onMarkRevealed]
  );

  const handlePointerUp = useCallback((e) => {
    e.preventDefault();
    setHoldingRevealIndex(null);
  }, []);

  const handlePointerCancel = useCallback(() => {
    setHoldingRevealIndex(null);
  }, []);

  const handleNext = () => {
    setHoldingRevealIndex(null);
    if (isLastPlayer) {
      onFinishReveal();
    } else {
      onNextReveal();
    }
  };

  if (!currentPlayer) return null;

  const isChor = currentPlayer.role === 'chor';

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-6 select-none">
      {/* Header */}
      <motion.div
        key={currentRevealIndex}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mb-2">
          Role Reveal
        </p>
        <h2 className="text-3xl font-bold text-white mb-1">
          {currentPlayer.name}
        </h2>
        <p className="text-gray-500 text-sm">
          Player {currentRevealIndex + 1} of {players.length}
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        key={`card-${currentRevealIndex}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        className={`w-64 h-80 sm:w-72 sm:h-88 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 touch-none ${
          isHolding
            ? isChor
              ? 'bg-red-500/15 border-2 border-red-500/50 shadow-lg shadow-red-500/20'
              : 'bg-blue-500/15 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20'
            : 'bg-gray-900 border-2 border-gray-700 hover:border-gray-600'
        }`}
        style={{
          WebkitUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
        }}
      >
        {isHolding ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center"
          >
            {isChor ? (
              <>
                <Skull className="w-16 h-16 text-red-500 mb-4" />
                <p className="text-3xl font-extrabold text-red-500 tracking-wider">
                  CHOR
                </p>
              </>
            ) : (
              <>
                <Shield className="w-16 h-16 text-blue-500 mb-4" />
                <p className="text-3xl font-extrabold text-blue-500 tracking-wider">
                  POLICE
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <EyeOff className="w-12 h-12 mb-4" />
            <p className="text-sm font-medium text-center px-6">
              Press &amp; hold to reveal your role
            </p>
          </div>
        )}
      </motion.div>

      {/* Instruction Text */}
      <p className="text-gray-600 text-xs mt-4 text-center">
        {isHolding ? 'Release to hide your role' : 'Only you should see this'}
      </p>

      {/* Next / Start Game Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={handleNext}
        disabled={!hasRevealed}
        className={`mt-8 flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all cursor-pointer ${
          hasRevealed
            ? isLastPlayer
              ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
        }`}
      >
        {isLastPlayer ? (
          <>
            <Play className="w-5 h-5" />
            START GAME
          </>
        ) : (
          <>
            Next Player
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>
    </div>
  );
}
