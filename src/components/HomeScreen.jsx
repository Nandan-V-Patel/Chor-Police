import { motion } from 'framer-motion';
import { Shield, Skull, Users, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const steps = [
  { num: 1, text: 'Add all players to the lobby.' },
  { num: 2, text: 'Roles are randomly assigned — Chor or Police.' },
  { num: 3, text: 'Each player secretly reveals their role by pressing and holding the card.' },
  { num: 4, text: 'Players discuss and vote among themselves.' },
  { num: 5, text: 'The selected player is eliminated through the app.' },
  { num: 6, text: 'Police win by catching every Chor.' },
  { num: 7, text: 'Chor wins when they outnumber the Police, or when only one Chor and one Police remain.' },
];

export default function HomeScreen({ onCreateGame }) {
  const [showHowTo, setShowHowTo] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-10">
      {/* Branding */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Skull className="w-10 h-10 text-red-500" />
          <Shield className="w-10 h-10 text-blue-500" />
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
          <span className="text-red-500">CHOR</span>{' '}
          <span className="text-blue-500">POLICE</span>
        </h1>
        <p className="text-gray-400 mt-3 text-lg">
          Find the imposters. Protect the innocents.
        </p>
      </motion.div>

      {/* Create Game Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreateGame}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-colors cursor-pointer"
      >
        <Users className="w-5 h-5" />
        CREATE GAME
      </motion.button>

      {/* How to Play */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 w-full max-w-md"
      >
        <button
          onClick={() => setShowHowTo(!showHowTo)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mx-auto transition-colors cursor-pointer"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">How to Play</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${
              showHowTo ? 'rotate-180' : ''
            }`}
          />
        </button>

        <motion.div
          initial={false}
          animate={{
            height: showHowTo ? 'auto' : 0,
            opacity: showHowTo ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="mt-4 bg-gray-900 rounded-2xl p-5 border border-gray-800 space-y-3">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 text-gray-400 text-xs font-bold flex items-center justify-center mt-0.5">
                  {step.num}
                </span>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

