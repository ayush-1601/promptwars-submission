import { PlayerColor } from './game-logic';

export interface Coord {
    r: number;
    c: number;
}

// 52 cells path mapping (starts at CRIMSON's entry point and goes clockwise)
const PATH_COORDS: Coord[] = [
    // CRIMSON Path
    { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },
    { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 }, { r: 0, c: 6 },
    { r: 0, c: 7 }, { r: 0, c: 8 },
    // SAPPHIRE Path
    { r: 1, c: 8 }, { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 },
    { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },
    { r: 7, c: 14 }, { r: 8, c: 14 },
    // GOLD Path
    { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 },
    { r: 9, c: 8 }, { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 }, { r: 14, c: 8 },
    { r: 14, c: 7 }, { r: 14, c: 6 },
    // EMERALD Path
    { r: 13, c: 6 }, { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 },
    { r: 8, c: 5 }, { r: 8, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 2 }, { r: 8, c: 1 }, { r: 8, c: 0 },
    { r: 7, c: 0 }, { r: 6, c: 0 }
];

const HOME_STRETCH_COORDS: Record<PlayerColor, Coord[]> = {
    CRIMSON: [{ r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }],
    SAPPHIRE: [{ r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }],
    GOLD: [{ r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }],
    EMERALD: [{ r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 }],
};

const NEST_COORDS: Record<PlayerColor, Coord[]> = {
    CRIMSON: [{ r: 1.5, c: 1.5 }, { r: 1.5, c: 3.5 }, { r: 3.5, c: 1.5 }, { r: 3.5, c: 3.5 }],
    SAPPHIRE: [{ r: 1.5, c: 10.5 }, { r: 1.5, c: 12.5 }, { r: 3.5, c: 10.5 }, { r: 3.5, c: 12.5 }],
    GOLD: [{ r: 10.5, c: 10.5 }, { r: 10.5, c: 12.5 }, { r: 12.5, c: 10.5 }, { r: 12.5, c: 12.5 }],
    EMERALD: [{ r: 10.5, c: 1.5 }, { r: 10.5, c: 3.5 }, { r: 12.5, c: 1.5 }, { r: 12.5, c: 3.5 }],
};

export function getPositionCoord(color: PlayerColor, position: number, index: number): Coord {
    if (position === -1) return NEST_COORDS[color][index];
    if (position >= 100 && position <= 105) return HOME_STRETCH_COORDS[color][position - 100];
    if (position === 200) return { r: 7, c: 7 }; // Center
    return PATH_COORDS[position % 52];
}
