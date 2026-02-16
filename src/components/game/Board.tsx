"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { PlayerColor } from '@/lib/game-logic';
import { useGameStore } from '@/store/useGameStore';
import { Pawn } from './Pawn';
import { getPositionCoord } from '@/lib/board-mapping';

const PLAYER_THEMES: Record<PlayerColor, { bg: string; border: string; text: string; cell: string; light: string }> = {
    RED: { bg: 'bg-red-500', border: 'border-red-700', text: 'text-red-100', cell: 'bg-red-200', light: 'bg-red-100' },
    BLUE: { bg: 'bg-blue-500', border: 'border-blue-700', text: 'text-blue-100', cell: 'bg-blue-200', light: 'bg-blue-100' },
    YELLOW: { bg: 'bg-yellow-400', border: 'border-yellow-600', text: 'text-yellow-900', cell: 'bg-yellow-200', light: 'bg-yellow-100' },
    GREEN: { bg: 'bg-green-500', border: 'border-green-700', text: 'text-green-100', cell: 'bg-green-200', light: 'bg-green-100' },
};

export const Board: React.FC = () => {
    const { pawns, currentPlayer, diceRoll, movePawn } = useGameStore();

    return (
        <div className="relative w-full max-w-[650px] aspect-square bg-slate-50 shadow-2xl rounded-xl overflow-hidden border-[12px] border-slate-900 p-1 group">
            <div className="grid grid-cols-15 grid-rows-15 w-full h-full">
                {renderCells()}
            </div>

            {/* Home Bases (Overlays) */}
            <HomeBase color="RED" className="top-0 left-0" />
            <HomeBase color="BLUE" className="top-0 right-0" />
            <HomeBase color="YELLOW" className="bottom-0 right-0" />
            <HomeBase color="GREEN" className="bottom-0 left-0" />

            {/* Pawns */}
            {pawns.map((pawn) => {
                const coord = getPositionCoord(pawn.color, pawn.position, pawn.index);
                const isSelectable = pawn.color === currentPlayer && diceRoll !== null; // Simplified selectable check

                return (
                    <div
                        key={pawn.id}
                        className="absolute z-30 transition-all duration-500 ease-out"
                        style={{
                            top: `${(coord.r / 15) * 100}%`,
                            left: `${(coord.c / 15) * 100}%`,
                            width: '6.66%',
                            height: '6.66%',
                        }}
                    >
                        <Pawn
                            id={pawn.id}
                            color={pawn.color}
                            isSelectable={isSelectable}
                            onClick={() => movePawn(pawn.id)}
                        />
                    </div>
                );
            })}

            {/* Center Square */}
            <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] z-20 overflow-hidden flex flex-wrap border-2 border-slate-800 bg-white">
                <div className="w-1/2 h-1/2 bg-red-500 border-r border-b border-slate-900/20" />
                <div className="w-1/2 h-1/2 bg-blue-500 border-b border-slate-900/20" />
                <div className="w-1/2 h-1/2 bg-green-500 border-r border-slate-900/20" />
                <div className="w-1/2 h-1/2 bg-yellow-400" />
            </div>
        </div>
    );
};

const HomeBase: React.FC<{ color: PlayerColor; className?: string }> = ({ color, className }) => {
    const theme = PLAYER_THEMES[color];
    return (
        <div className={cn("absolute w-[40%] h-[40%] p-2 z-10", className)}>
            <div className={cn("w-full h-full rounded-lg shadow-xl flex items-center justify-center p-4 border-4 border-slate-900/10", theme.bg)}>
                <div className="w-full h-full bg-white/40 backdrop-blur-sm rounded-md grid grid-cols-2 grid-rows-2 gap-4 p-6">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-black/5" />
                    ))}
                </div>
            </div>
        </div>
    );
};

function renderCells() {
    const cells = [];
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            let cellClass = "bg-white";

            // Home Stretch and Entry logic
            if (r === 7 && c > 0 && c < 6) cellClass = "bg-red-500";
            if (r === 6 && c === 1) cellClass = "bg-red-500";

            if (c === 7 && r > 0 && r < 6) cellClass = "bg-blue-500";
            if (r === 1 && c === 8) cellClass = "bg-blue-500";

            if (r === 7 && c > 8 && c < 14) cellClass = "bg-yellow-400";
            if (r === 8 && c === 13) cellClass = "bg-yellow-400";

            if (c === 7 && r > 8 && r < 14) cellClass = "bg-green-500";
            if (r === 13 && c === 6) cellClass = "bg-green-500";

            const isSafe = ([6, 8].includes(r) && [2, 12].includes(c)) || ([2, 12].includes(r) && [6, 8].includes(c));
            const isPath = (r >= 6 && r <= 8) || (c >= 6 && c <= 8);
            const isHome = (r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c < 6) || (r > 8 && c > 8);

            cells.push(
                <div
                    key={`${r}-${c}`}
                    className={cn(
                        "w-full h-full border-[0.5px] border-slate-900/10 flex items-center justify-center",
                        cellClass,
                        (isHome && !(isPath)) && "opacity-0"
                    )}
                >
                    {isSafe && cellClass === "bg-white" && <span className="text-slate-300 text-[10px] scale-150">★</span>}
                </div>
            );
        }
    }
    return cells;
}
