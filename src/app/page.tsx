"use client";

import React from 'react';
import { Board } from '@/components/game/Board';
import { ThemeSetup } from '@/components/setup/ThemeSetup';
import { useGameStore } from '@/store/useGameStore';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const {
    isSetupOpen,
    completeSetup,
  } = useGameStore();

  return (
    <main className="fixed inset-0 bg-[#020617] overflow-hidden">
      <AnimatePresence>
        {isSetupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <ThemeSetup onComplete={completeSetup} />
          </motion.div>
        )}
      </AnimatePresence>

      <Board />
    </main>
  );
}
