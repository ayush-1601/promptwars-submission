"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PlayerColor } from '@/lib/game-logic';
import { useGameStore } from '@/store/useGameStore';

interface PawnProps {
    id: string;
    color: PlayerColor;
    isSelectable: boolean;
    onClick: () => void;
    className?: string;
}

const COLOR_TIER: Record<PlayerColor, string> = {
    RED: 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]',
    BLUE: 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]',
    YELLOW: 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]',
    GREEN: 'bg-green-600 shadow-[0_0_15px_rgba(22,163,74,0.4)]',
};

export const Pawn: React.FC<PawnProps> = ({ color, isSelectable, onClick, className }) => {
    const themes = useGameStore((state) => state.themes);
    const themeText = themes[color] || 'Sentient Pawn';

    return (
        <motion.div
            layoutId={`pawn-${color}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={isSelectable ? { scale: 1.2, y: -4, zIndex: 50 } : { scale: 1.1, zIndex: 50 }}
            onClick={onClick}
            className={cn(
                "relative w-[80%] h-[80%] cursor-pointer flex items-center justify-center group",
                className
            )}
        >
            <div
                className={cn(
                    "w-full h-full rounded-full border-2 border-white/40 flex items-center justify-center overflow-hidden transition-all duration-300",
                    COLOR_TIER[color],
                    isSelectable && "ring-4 ring-white animate-pulse"
                )}
            >
                {/* Abstract 3D Representation */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                <div className="w-1/2 h-1/2 bg-white/30 rounded-full blur-[2px]" />

                {/* Theme Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all origin-bottom bg-slate-900/90 backdrop-blur-md text-white border border-white/10 p-2 rounded-lg whitespace-nowrap shadow-2xl pointer-events-none">
                    <p className="text-[10px] font-black uppercase tracking-tighter text-blue-400 mb-0.5">Team {color}</p>
                    <p className="text-[11px] font-medium italic text-slate-200">{themeText}</p>
                </div>
            </div>
        </motion.div>
    );
};
