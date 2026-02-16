"use client";

import { create } from 'zustand';
import {
    Pawn,
    PlayerColor,
    PLAYER_COLORS,
    START_POSITIONS,
    isSafePosition
} from '../lib/game-logic';
import { generateDialogue } from '@/services/gemini';
import { voiceService } from '@/services/voice';

interface GameState {
    pawns: Pawn[];
    currentPlayer: PlayerColor;
    diceRoll: number | null;
    isRolling: boolean;
    gameLog: string[];
    winner: PlayerColor | null;
    isSetupOpen: boolean;
    themes: Record<PlayerColor, string>;

    rollDice: () => void;
    movePawn: (pawnId: string) => void;
    resetGame: () => void;
    completeSetup: (themes: Record<PlayerColor, string>) => void;
    triggerAIResponse: (color: PlayerColor, event: any, context?: string) => Promise<void>;
}

const initialPawns: Pawn[] = PLAYER_COLORS.flatMap((color) =>
    Array.from({ length: 4 }).map((_, i) => ({
        id: `${color}-${i}`,
        color,
        position: -1,
        index: i,
    }))
);

export const useGameStore = create<GameState>((set, get) => ({
    pawns: initialPawns,
    currentPlayer: 'CRIMSON',
    diceRoll: null,
    isRolling: false,
    gameLog: ['Welcome to Ludo Echoes! Team Crimson starts.'],
    winner: null,
    isSetupOpen: true,
    themes: {
        CRIMSON: '',
        SAPPHIRE: '',
        GOLD: '',
        EMERALD: '',
    },

    completeSetup: (themes) => set({ themes, isSetupOpen: false }),

    triggerAIResponse: async (color, event, context) => {
        const dialogue = await generateDialogue(color, event, context);
        set(state => ({
            gameLog: [`[${color}] ${dialogue}`, ...state.gameLog]
        }));
        voiceService.speak(dialogue, color);
    },

    rollDice: () => {
        const { isRolling, winner, currentPlayer, pawns } = get();
        if (isRolling || winner) return;

        set({ isRolling: true });

        setTimeout(async () => {
            const roll = Math.floor(Math.random() * 6) + 1;
            set({ diceRoll: roll, isRolling: false });

            const canMoveAny = pawns.some(p => p.color === currentPlayer && canMovePawnLogic(p, roll));

            if (!canMoveAny) {
                set(state => ({
                    gameLog: [`${currentPlayer} rolled a ${roll} but has no moves.`, ...state.gameLog],
                    currentPlayer: getNextPlayer(state.currentPlayer),
                    diceRoll: null
                }));
            }
        }, 600);
    },

    movePawn: async (pawnId) => {
        const { pawns, diceRoll, currentPlayer, winner, triggerAIResponse } = get();
        if (diceRoll === null || winner) return;

        const pawn = pawns.find(p => p.id === pawnId);
        if (!pawn || pawn.color !== currentPlayer || !canMovePawnLogic(pawn, diceRoll)) return;

        const isExitingHome = pawn.position === -1;
        let newPosition = isExitingHome ? START_POSITIONS[pawn.color] : calculateNextPosition(pawn, diceRoll);

        let updatedPawns = [...pawns];
        let capturedSomeone = false;

        if (newPosition >= 0 && newPosition <= 51 && !isSafePosition(newPosition)) {
            const opponentPawnsAtPos = pawns.filter(p => p.color !== currentPlayer && p.position === newPosition);
            if (opponentPawnsAtPos.length > 0) {
                capturedSomeone = true;
                updatedPawns = updatedPawns.map(p => {
                    if (p.color !== currentPlayer && p.position === newPosition) {
                        triggerAIResponse(p.color, 'captured');
                        return { ...p, position: -1 };
                    }
                    return p;
                });
            }
        }

        updatedPawns = updatedPawns.map(p => p.id === pawnId ? { ...p, position: newPosition } : p);

        if (capturedSomeone) {
            triggerAIResponse(currentPlayer, 'capture');
        } else if (newPosition === 200) {
            triggerAIResponse(currentPlayer, 'home');
        } else if (isExitingHome) {
            triggerAIResponse(currentPlayer, 'start');
        } else {
            if (Math.random() > 0.7) triggerAIResponse(currentPlayer, 'move');
        }

        const playerPawns = updatedPawns.filter(p => p.color === currentPlayer);
        const hasWon = playerPawns.every(p => p.position === 200);

        set({
            pawns: updatedPawns,
            diceRoll: null,
            currentPlayer: (diceRoll === 6 && !hasWon) ? currentPlayer : getNextPlayer(currentPlayer),
            winner: hasWon ? currentPlayer : null,
        });
    },

    resetGame: () => set({
        pawns: initialPawns,
        currentPlayer: 'CRIMSON',
        diceRoll: null,
        gameLog: ['Game Reset.'],
        winner: null,
        isSetupOpen: true
    }),
}));

function getNextPlayer(current: PlayerColor): PlayerColor {
    const index = PLAYER_COLORS.indexOf(current);
    return PLAYER_COLORS[(index + 1) % 4];
}

export function canMovePawnLogic(pawn: Pawn, roll: number): boolean {
    if (pawn.position === -1) return roll === 6;
    if (pawn.position === 200) return false;

    if (pawn.position >= 100) {
        return pawn.position + roll <= 105;
    }

    const startPos = START_POSITIONS[pawn.color];
    const stepsTaken = (pawn.position - startPos + 52) % 52;

    if (stepsTaken + roll > 51) {
        const overflow = stepsTaken + roll - 51;
        return 100 + overflow - 1 <= 105;
    }

    return true;
}

function calculateNextPosition(pawn: Pawn, roll: number): number {
    const startPos = START_POSITIONS[pawn.color];
    const stepsTaken = (pawn.position - startPos + 52) % 52;

    if (stepsTaken + roll > 51) {
        const overflow = stepsTaken + roll - 51;
        const homePos = 100 + overflow - 1;
        return homePos === 105 ? 200 : homePos;
    }

    return (pawn.position + roll) % 52;
}
