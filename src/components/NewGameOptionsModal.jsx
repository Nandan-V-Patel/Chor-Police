import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, X } from 'lucide-react';

export default function NewGameOptionsModal({
  isOpen,
  onCancel,
  onBackToLobby,
  onStartNewGame,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-game-options-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <button
            aria-label="Close new game options"
            onClick={onCancel}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-sm rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl"
          >
            <button
              onClick={onCancel}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 id="new-game-options-title" className="mb-2 pr-6 text-lg font-bold text-white">
              What would you like to do?
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Return to the lobby to change the player list, or play another round with these players.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={onBackToLobby}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-800 py-3 font-medium text-gray-200 transition-colors hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Lobby
              </button>
              <button
                onClick={onStartNewGame}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-bold text-white transition-colors hover:bg-green-500"
              >
                <RotateCcw className="h-4 w-4" />
                Start New Game
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
