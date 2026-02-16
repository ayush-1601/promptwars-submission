export type PlayerColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';

export interface Pawn {
    id: string;
    color: PlayerColor;
    position: number; // -1: nest, 0-51: path, 100-105: home stretch, 200: finished
    index: number; // 0-3
}

export const PLAYER_COLORS: PlayerColor[] = ['RED', 'BLUE', 'YELLOW', 'GREEN'];

export const START_POSITIONS: Record<PlayerColor, number> = {
    RED: 0,
    BLUE: 13,
    YELLOW: 26,
    GREEN: 39,
};

export const HOME_STRETCH_START: Record<PlayerColor, number> = {
    RED: 50,
    BLUE: 11,
    YELLOW: 24,
    GREEN: 37,
};

export function getSafePositions(): number[] {
    return [0, 8, 13, 21, 26, 34, 39, 47];
}

export function isSafePosition(pos: number): boolean {
    return getSafePositions().includes(pos);
}
