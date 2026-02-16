"use client";

import React from 'react';
import { Board } from '@/components/game/Board';
import { Dice } from '@/components/game/Dice';
import { ThemeSetup } from '@/components/setup/ThemeSetup';
import { useGameStore } from '@/store/useGameStore';
import { ScrollText, Trophy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const {
    currentPlayer,
    diceRoll,
    isRolling,
    rollDice,
    gameLog,
    winner,
    resetGame,
    isSetupOpen,
    completeSetup,
    themes
  } = useGameStore();

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center py-8 px-4 gap-8">
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

      {/* Header */}
      <div className="text-center space-y-2 relative z-10">
        <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-red-500 via-blue-500 to-yellow-500 bg-clip-text text-transparent">
          LUDO ECHOES
        </h1>
        <p className="text-slate-400 font-medium tracking-widest text-xs uppercase">
          Sentient 3D AI Avatars • Retro Royale Edition
        </p>
      </div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-start justify-center gap-12 relative z-10">
        {/* Left Sidebar - Player Stats & Dice */}
        <div className="w-full lg:w-1/4 flex flex-col gap-8 order-2 lg:order-1">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 border border-slate-700/50 shadow-2xl flex flex-col items-center gap-6">
            <Dice
              value={diceRoll}
              isRolling={isRolling}
              onRoll={rollDice}
              currentPlayer={currentPlayer}
              disabled={!!winner || isRolling || diceRoll !== null}
            />

            <button
              onClick={resetGame}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              <RotateCcw size={14} />
              Reset Game
            </button>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <Trophy size={18} />
              <span className="text-sm font-bold uppercase tracking-tight">Leaderboard</span>
            </div>
            <div className="space-y-3">
              {['RED', 'BLUE', 'YELLOW', 'GREEN'].map((color) => (
                <div key={color} className="flex flex-col gap-1 p-3 bg-slate-900/50 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", {
                        'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]': color === 'RED',
                        'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]': color === 'BLUE',
                        'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]': color === 'YELLOW',
                        'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]': color === 'GREEN',
                      })} />
                      <span className="text-xs font-bold">{color}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">0 / 4</span>
                  </div>
                  {themes[color as any] && (
                    <p className="text-[9px] text-slate-600 truncate uppercase tracking-wider font-bold italic">
                      {themes[color as any]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Game Board */}
        <div className="flex-1 flex justify-center order-1 lg:order-2">
          <Board />
        </div>

        {/* Right Sidebar - Battle Log */}
        <div className="w-full lg:w-1/4 h-[650px] bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl flex flex-col order-3">
          <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScrollText size={18} className="text-blue-400" />
              <span className="text-sm font-bold uppercase tracking-tight">Battle Log</span>
            </div>
            <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full" title="AI Sentience Active" />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
            {gameLog.map((log, i) => (
              <div key={i} className="text-sm text-slate-300 bg-slate-900/30 p-3 rounded-xl border border-white/5 animate-in fade-in slide-in-from-bottom-2">
                <span className="text-slate-500 text-[10px] font-mono mr-2">{i + 1}</span>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Winner Overlay */}
      {winner && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-800 border-2 border-yellow-500/50 p-12 rounded-[3rem] shadow-[0_0_100px_rgba(234,179,8,0.2)] text-center space-y-6">
            <Trophy size={80} className="mx-auto text-yellow-500 animate-bounce" />
            <h2 className="text-6xl font-black">{winner} WINS!</h2>
            <p className="text-slate-400 uppercase tracking-widest font-bold">The Echoes have spoken.</p>
            <button
              onClick={resetGame}
              className="bg-yellow-500 text-slate-900 px-8 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
