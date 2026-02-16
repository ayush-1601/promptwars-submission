"use client";

import React, { useState } from 'react';
import { PlayerColor, PLAYER_COLORS_3D } from '@/lib/game-logic';
import { useGameStore } from '@/store/useGameStore';
import { ThreeBoard } from './ThreeBoard';
import { Dice } from './Dice';
import { HandGestureDetector } from './HandGestureDetector';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Trophy, X, RefreshCw } from 'lucide-react';

export const Board: React.FC = () => {
    const {
        currentPlayer,
        diceRoll,
        isRolling,
        rollDice,
        gameLog,
        winner,
        resetGame
    } = useGameStore();

    const [isLogOpen, setIsLogOpen] = useState(false);

    return (
        <div className="fixed inset-0 bg-[#f1f5f9] flex items-center justify-center overflow-hidden font-sans text-slate-900">
            {/* 3D Board Background */}
            <div className="absolute inset-0 z-0">
                <ThreeBoard />
            </div>

            <HandGestureDetector />

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
                <div className="flex justify-between items-start w-full">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="bg-white/90 backdrop-blur-md p-6 rounded-[2.5rem] border border-black/5 shadow-xl pointer-events-auto flex items-center gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tight leading-none">LUDO ECHOES</h1>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Light Edition</p>
                            </div>
                        </div>

                        <div className="h-10 w-px bg-slate-200" />

                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: PLAYER_COLORS_3D[currentPlayer] }} />
                            <span className="text-sm font-black uppercase tracking-widest text-slate-600">{currentPlayer}'s TURN</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-3 pointer-events-auto"
                    >
                        <button
                            onClick={() => setIsLogOpen(true)}
                            className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-black/5 shadow-lg flex items-center gap-3 hover:bg-slate-50 transition-all group"
                        >
                            <ScrollText size={20} className="text-slate-400 group-hover:text-blue-500" />
                        </button>
                        <button
                            onClick={resetGame}
                            className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-black/5 shadow-lg flex items-center gap-3 hover:bg-red-50 transition-all group pointer-events-auto"
                        >
                            <RefreshCw size={20} className="text-slate-400 group-hover:text-red-500" />
                        </button>
                    </motion.div>
                </div>

                <div className="flex justify-center items-end pb-4">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white/90 backdrop-blur-md p-8 rounded-[3.5rem] border border-black/5 shadow-2xl pointer-events-auto"
                    >
                        <Dice
                            value={diceRoll}
                            isRolling={isRolling}
                            onRoll={rollDice}
                            currentPlayer={currentPlayer}
                            disabled={isRolling}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Log Modal */}
            <AnimatePresence>
                {isLogOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsLogOpen(false)}
                            className="absolute inset-0 bg-slate-400/20 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[3rem] border border-black/5 shadow-[0_40px_100px_rgba(0,0,0,0.15)] overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h2 className="text-xl font-black tracking-tight text-slate-900">WAR LOG</h2>
                                <button onClick={() => setIsLogOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="h-[400px] overflow-y-auto p-8 space-y-4">
                                {gameLog.map((log, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-4 bg-slate-50 rounded-2xl border border-black/5 flex gap-4 items-start"
                                    >
                                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: PLAYER_COLORS_3D[currentPlayer] }} />
                                        <p className="text-sm font-medium leading-relaxed text-slate-700 italic">{log}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Winner Toast */}
            {winner && (
                <div className="fixed inset-0 z-[200] bg-white/60 backdrop-blur-xl flex items-center justify-center p-6">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-12 rounded-[4rem] text-center shadow-[0_40px_100px_rgba(255,255,255,0.5)] border border-black/5"
                    >
                        <h2 className="text-7xl font-black text-slate-950 mb-4">{winner} VICTORIOUS</h2>
                        <p className="text-slate-400 uppercase tracking-widest font-bold mb-8 italic">The Light Eternal has been restored.</p>
                        <button
                            onClick={resetGame}
                            className="bg-slate-950 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
                        >
                            Return to Selection
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
