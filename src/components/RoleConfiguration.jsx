import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Skull, Shield, ToggleLeft, ToggleRight, Minus, Plus } from 'lucide-react';
import { calculateChors, isValidChorCount } from '../utils/gameLogic';

export default function RoleConfiguration({
  players,
  allocationMode,
  configuredChors,
  onSetAllocationMode,
  onSetConfiguredChors,
  onStartGame,
  onBack,
}) {
  const totalPlayers = players.length;

  const autoChors = calculateChors(totalPlayers);
  const chorCount = allocationMode === 'automatic' ? autoChors : configuredChors;
  const policeCount = totalPlayers - chorCount;

  const isManual = allocationMode === 'manual';

  const handleIncrement = () => {
    const next = configuredChors + 1;
    if (isValidChorCount(next, totalPlayers)) {
      onSetConfiguredChors(next);
    }
  };

  const handleDecrement = () => {
    const next = configuredChors - 1;
    if (isValidChorCount(next, totalPlayers)) {
      onSetConfiguredChors(next);
    }
  };

  const handleToggle = () => {
    if (isManual) {
      onSetAllocationMode('automatic');
    } else {
      onSetAllocationMode('manual');
      // Initialise manual count to auto value
      onSetConfiguredChors(autoChors);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h2 className="text-2xl font-bold">Role Configuration</h2>
          <p className="text-gray-500 text-sm">{totalPlayers} players in the game</p>
        </div>
      </div>

      {/* Allocation Mode Toggle */}
      <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-white">Custom Chor Count</span>
          <button onClick={handleToggle} className="cursor-pointer">
            {isManual ? (
              <ToggleRight className="w-10 h-10 text-blue-500" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-gray-600" />
            )}
          </button>
        </div>
        <p className="text-gray-500 text-sm">
          {isManual
            ? 'Manually choose the number of Chors.'
            : 'The number of Chors is calculated automatically.'}
        </p>
      </div>

      {/* Manual Selector */}
      {isManual && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6"
        >
          <p className="text-gray-400 text-sm mb-4">Number of Chors</p>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleDecrement}
              disabled={configuredChors <= 1}
              className="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-4xl font-bold text-white w-12 text-center">
              {configuredChors}
            </span>
            <button
              onClick={handleIncrement}
              disabled={configuredChors >= totalPlayers - 1}
              className="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Role Distribution Preview */}
      <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-8">
        <p className="text-gray-400 text-sm mb-4 font-medium">Role Distribution</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <Skull className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-400">{chorCount}</p>
            <p className="text-red-400/70 text-sm mt-1">
              Chor{chorCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-400">{policeCount}</p>
            <p className="text-blue-400/70 text-sm mt-1">
              Police
            </p>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Start Game Button */}
      <button
        onClick={onStartGame}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-600/20 transition-colors cursor-pointer"
      >
        Start Game
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

