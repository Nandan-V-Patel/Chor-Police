import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, Users, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Lobby({
  players,
  onAddPlayer,
  onRemovePlayer,
  onContinue,
  onBack,
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a name.');
      return;
    }

    // Check for duplicate names (case-insensitive)
    const duplicate = players.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setError(`"${trimmed}" is already added.`);
      return;
    }

    onAddPlayer(trimmed);
    setName('');
    setError('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const canStart = players.length >= 3;

  return (
    <div className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h2 className="text-2xl font-bold">Player Lobby</h2>
          <p className="text-gray-500 text-sm">Add everyone who's playing</p>
        </div>
      </div>

      {/* Input Row */}
      <div className="flex gap-2 mb-2">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter player name"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
          autoFocus
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors cursor-pointer flex-shrink-0"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-sm mb-3 px-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Player Count */}
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-3 px-1">
        <Users className="w-4 h-4" />
        <span>
          {players.length} player{players.length !== 1 ? 's' : ''} added
          {players.length < 3 && (
            <span className="text-gray-600"> · minimum 3 required</span>
          )}
        </span>
      </div>

      {/* Player List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-6">
        <AnimatePresence>
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center bg-gray-900 border border-gray-800 rounded-xl px-4 py-3"
            >
              <span className="w-7 h-7 rounded-full bg-gray-800 text-gray-500 text-xs font-bold flex items-center justify-center mr-3 flex-shrink-0">
                {index + 1}
              </span>
              <span className="flex-1 text-white font-medium truncate">
                {player.name}
              </span>
              <button
                onClick={() => onRemovePlayer(player.id)}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        disabled={!canStart}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg transition-all cursor-pointer ${
          canStart
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
        }`}
      >
        Continue
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

