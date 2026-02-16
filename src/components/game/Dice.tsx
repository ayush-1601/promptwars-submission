"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PlayerColor, PLAYER_COLORS_3D } from '@/lib/game-logic';

interface DiceProps {
    value: number | null;
    isRolling: boolean;
    onRoll: () => void;
    currentPlayer: PlayerColor;
    disabled: boolean;
}

export const Dice: React.FC<DiceProps> = ({ value, isRolling, onRoll, currentPlayer, disabled }) => {
    const color = PLAYER_COLORS_3D[currentPlayer];

    return (
        <div className="flex flex-col items-center gap-6">
            <motion.button
                whileHover={!disabled ? { scale: 1.05 } : {}}
                whileTap={!disabled ? { scale: 0.95 } : {}}
                onClick={onRoll}
                disabled={disabled}
                className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all border-4 relative overflow-hidden group",
                    {
                        "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed": isRolling,
                        "bg-white border-slate-200 text-slate-400": !isRolling && value === null,
                        "bg-white border-slate-200 text-slate-900": !isRolling && value !== null,
                    }
                )}
                style={{
                    boxShadow: !isRolling && value !== null ? `0 0 30px ${color}22, inset 0 0 10px rgba(0,0,0,0.05)` : 'inset 0 0 10px rgba(0,0,0,0.05)',
                    borderColor: !isRolling && value !== null ? color : undefined
                }}
            >
                {/* Surface Shine */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={isRolling ? 'rolling' : (value || 'idle')}
                        initial={{ opacity: 0, rotate: -360 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 360 }}
                        className="relative z-10"
                    >
                        {isRolling ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                                className="text-5xl"
                            >
                                🌑
                            </motion.div>
                        ) : (
                            <div className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                                {value || '?'}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.button>

            {!isRolling && value === null && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 animate-pulse"
                >
                    Tap to Fire
                </motion.div>
            )}
        </div>
    );
};
