import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Skull, RotateCcw } from 'lucide-react';
import NewGameOptionsModal from './NewGameOptionsModal';

export default function VictoryScreen({
  gameStatus,
  victoryReason,
  players,
  onNewGame,
  onBackToLobby,
}) {
  const [showNewGameOptions, setShowNewGameOptions] = useState(false);
  const isPoliceWin = gameStatus === 'police_win';

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-10">
      {/* Trophy Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.7, bounce: 0.5 }}
        className="mb-6"
      >
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center ${
            isPoliceWin
              ? 'bg-blue-500/20 ring-2 ring-blue-500/40'
              : 'bg-red-500/20 ring-2 ring-red-500/40'
          }`}
        >
          {isPoliceWin ? (
            <Shield className="w-12 h-12 text-blue-500" />
          ) : (
            <Skull className="w-12 h-12 text-red-500" />
          )}
        </div>
      </motion.div>

      {/* Winner Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <h1
          className={`text-4xl sm:text-5xl font-extrabold mb-3 ${
            isPoliceWin ? 'text-blue-500' : 'text-red-500'
          }`}
        >
          {isPoliceWin ? 'POLICE WON!' : 'CHOR WON!'}
        </h1>
        <p className="text-gray-400 text-lg max-w-xs mx-auto">
          {victoryReason}
        </p>
      </motion.div>

      {/* Role Reveal Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-8"
      >
        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-3">
          All Roles
        </p>
        <div className="space-y-2">
          {players.map((player) => {
            const isChor = player.role === 'chor';
            return (
              <div
                key={player.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                  player.isEliminated ? 'opacity-50' : ''
                }`}
              >
                {isChor ? (
                  <Skull className="w-4 h-4 text-red-500 flex-shrink-0" />
                ) : (
                  <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
                <span
                  className={`flex-1 font-medium text-sm ${
                    player.isEliminated
                      ? 'line-through text-gray-600'
                      : 'text-white'
                  }`}
                >
                  {player.name}
                </span>
                <span
                  className={`text-xs font-bold ${
                    isChor ? 'text-red-400' : 'text-blue-400'
                  }`}
                >
                  {isChor ? 'CHOR' : 'POLICE'}
                </span>
                {player.isEliminated && (
                  <span className="text-gray-600 text-xs">OUT</span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* New Game Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowNewGameOptions(true)}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-green-600/20 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-5 h-5" />
        NEW GAME
      </motion.button>

      <NewGameOptionsModal
        isOpen={showNewGameOptions}
        onCancel={() => setShowNewGameOptions(false)}
        onBackToLobby={onBackToLobby}
        onStartNewGame={onNewGame}
      />
    </div>
  );
}

