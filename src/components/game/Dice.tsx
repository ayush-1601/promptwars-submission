"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlayerColor } from '@/lib/game-logic';

interface DiceProps {
    value: number | null;
    isRolling: boolean;
    onRoll: () => void;
    currentPlayer: PlayerColor;
    disabled: boolean;
}

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export const Dice: React.FC<DiceProps> = ({ value, isRolling, onRoll, currentPlayer, disabled }) => {
    const Icon = value ? DICE_ICONS[value - 1] : Dice1;

    const colorClasses: Record<PlayerColor, string> = {
        RED: 'text-red-500 border-red-500',
        BLUE: 'text-blue-500 border-blue-500',
        YELLOW: 'text-yellow-500 border-yellow-500',
        GREEN: 'text-green-500 border-green-500',
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className={cn("text-xs font-bold uppercase tracking-widest", colorClasses[currentPlayer].split(' ')[0])}>
                {currentPlayer}'s Turn
            </div>

            <motion.button
                whileHover={!disabled ? { scale: 1.1 } : {}}
                whileTap={!disabled ? { scale: 0.9 } : {}}
                onClick={onRoll}
                disabled={disabled}
                className={cn(
                    "w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 transition-all duration-300",
                    colorClasses[currentPlayer],
                    disabled && "opacity-50 cursor-not-allowed",
                    isRolling && "animate-bounce"
                )}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isRolling ? 'rolling' : (value || 'idle')}
                        initial={{ opacity: 0, rotate: -180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 180 }}
                    >
                        {isRolling ? (
                            <div className="grid grid-cols-2 gap-1 scale-75">
                                <div className="w-3 h-3 bg-current rounded-full animate-pulse" />
                                <div className="w-3 h-3 bg-current rounded-full animate-pulse delay-75" />
                                <div className="w-3 h-3 bg-current rounded-full animate-pulse delay-150" />
                                <div className="w-3 h-3 bg-current rounded-full animate-pulse delay-300" />
                            </div>
                        ) : (
                            <Icon size={48} strokeWidth={2.5} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.button>

            {value && !isRolling && !disabled && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-sm font-medium text-slate-500"
                >
                    Rolled a {value}!
                </motion.div>
            )}
        </div>
    );
};
