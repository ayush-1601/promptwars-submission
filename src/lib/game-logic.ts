export type PlayerColor = 'CRIMSON' | 'SAPPHIRE' | 'EMERALD' | 'GOLD';

export interface Pawn {
    id: string;
    color: PlayerColor;
    position: number; // -1: nest, 0-51: path, 100-105: home stretch, 200: finished
    index: number; // 0-3
}

export const PLAYER_COLORS: PlayerColor[] = ['CRIMSON', 'SAPPHIRE', 'GOLD', 'EMERALD'];

export const PLAYER_COLORS_3D: Record<PlayerColor, string> = {
    CRIMSON: '#ef4444',
    SAPPHIRE: '#3b82f6',
    GOLD: '#eab308',
    EMERALD: '#22c55e',
};

export const START_POSITIONS: Record<PlayerColor, number> = {
    CRIMSON: 0,
    SAPPHIRE: 13,
    GOLD: 26,
    EMERALD: 39,
};

export const HOME_STRETCH_START: Record<PlayerColor, number> = {
    CRIMSON: 50,
    SAPPHIRE: 11,
    GOLD: 24,
    EMERALD: 37,
};

export function getSafePositions(): number[] {
    return [0, 8, 13, 21, 26, 34, 39, 47];
}

export function isSafePosition(pos: number): boolean {
    return getSafePositions().includes(pos);
}
