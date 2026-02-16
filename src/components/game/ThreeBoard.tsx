"use client";

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, MeshDistortMaterial, Shadow, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';
import { PlayerColor, PLAYER_COLORS_3D } from '@/lib/game-logic';
import { useGameStore, canMovePawnLogic } from '@/store/useGameStore';
import { getPositionCoord } from '@/lib/board-mapping';

const BOARD_SIZE = 15;
const CELL_SIZE = 1;
const SPACING = 1.1;

const BoardCell = ({ r, c, color, isSafe }: { r: number, c: number, color?: string, isSafe?: boolean }) => {
    const x = (c - 7) * SPACING;
    const z = (r - 7) * SPACING;
    const height = 0.15 + (Math.random() * 0.05);

    return (
        <mesh position={[x, -0.1, z]} receiveShadow>
            <boxGeometry args={[1, height, 1]} />
            <meshStandardMaterial
                color={color || '#fdf6e3'}
                roughness={0.9}
                metalness={0.05}
            />
            <mesh position={[0, height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.95, 0.95]} />
                <meshStandardMaterial
                    color={color || '#eee1c5'}
                    transparent
                    opacity={0.3}
                    roughness={1}
                />
            </mesh>
            {isSafe && (
                <mesh position={[0, height / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.2, 0.35, 32]} />
                    <meshBasicMaterial color="#475569" transparent opacity={0.2} />
                </mesh>
            )}
        </mesh>
    );
};

// Pawn Variations
const Warrior = ({ color }: { color: string }) => (
    <group>
        <mesh castShadow position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 0.7, 8]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 0.75, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh castShadow position={[0, 0.9, 0]}>
            <coneGeometry args={[0.04, 0.2, 8]} />
            <meshStandardMaterial color={color} />
        </mesh>
    </group>
);

const Guardian = ({ color }: { color: string }) => (
    <group>
        <mesh castShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[0.5, 0.8, 0.5]} />
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0.9, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
        <mesh castShadow position={[0.4, 0.4, 0]}>
            <boxGeometry args={[0.1, 0.7, 0.4]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
    </group>
);

const Sentinel = ({ color }: { color: string }) => (
    <group>
        <mesh castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 1, 8]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0, 1.1, 0]}>
            <octahedronGeometry args={[0.2]} />
            <meshStandardMaterial color="#334155" emmissive={color} emmissiveIntensity={0.5} />
        </mesh>
        <mesh castShadow position={[0, 0.2, 0]}>
            <torusGeometry args={[0.3, 0.05, 16, 32]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={color} />
        </mesh>
    </group>
);

const Soldier = ({ color, index, isSelectable }: { color: PlayerColor, index: number, isSelectable: boolean }) => {
    const baseColor = PLAYER_COLORS_3D[color];
    const Variation = [Warrior, Warrior, Guardian, Sentinel][index % 4];

    return (
        <group>
            <Variation color={baseColor} />
            {isSelectable && (
                <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.5, 0.6, 32]} />
                    <meshBasicMaterial color="gold" transparent opacity={0.8} />
                </mesh>
            )}
        </group>
    );
};

const ThreePawn = ({ id, color, position, index }: { id: string, color: PlayerColor, position: number, index: number }) => {
    const { movePawn, currentPlayer, diceRoll } = useGameStore();
    const coord = useMemo(() => getPositionCoord(color, position, index), [color, position, index]);

    const pawn = useMemo(() => ({ id, color, position, index } as any), [id, color, position, index]);
    const isSelectable = color === currentPlayer && diceRoll !== null && canMovePawnLogic(pawn, diceRoll);

    const x = (coord.c - 7) * SPACING;
    const z = (coord.r - 7) * SPACING;
    const y = isSelectable ? 0.8 : 0.5;

    return (
        <Float speed={isSelectable ? 5 : 2} rotationIntensity={isSelectable ? 1 : 0.5} floatIntensity={isSelectable ? 1 : 0.5}>
            <group position={[x, y, z]} onClick={(e) => {
                e.stopPropagation();
                if (isSelectable) movePawn(id);
            }}>
                <Soldier color={color} index={index} isSelectable={isSelectable} />
            </group>
        </Float>
    );
};

const Tree = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        <mesh castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.05, 0.1, 1, 8]} />
            <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh castShadow position={[0, 1.2, 0]}>
            <coneGeometry args={[0.4, 1, 8]} />
            <meshStandardMaterial color="#166534" />
        </mesh>
        <mesh castShadow position={[0, 1.6, 0]}>
            <coneGeometry args={[0.3, 0.8, 8]} />
            <meshStandardMaterial color="#14532d" />
        </mesh>
    </group>
);

const Bush = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        <mesh castShadow position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="#166534" />
        </mesh>
        <mesh castShadow position={[0.15, 0.15, 0.15]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#15803d" />
        </mesh>
        <mesh castShadow position={[-0.1, 0.12, -0.1]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#14532d" />
        </mesh>
    </group>
);

const DesertEnvironment = () => {
    const items = useMemo(() => {
        const flora = [];
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 12 + Math.random() * 20;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            if (Math.random() > 0.4) {
                flora.push(<Tree key={`tree-${i}`} position={[x, -0.2, z]} />);
            } else {
                flora.push(<Bush key={`bush-${i}`} position={[x, -0.2, z]} />);
            }
        }
        return flora;
    }, []);

    return <group>{items}</group>;
};

const CentralCitadel = () => (
    <group position={[0, 0.2, 0]}>
        {/* Massive Base */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[3, 1.5, 3]} />
            <meshStandardMaterial color="#64748b" roughness={0.8} />
        </mesh>
        {/* Main Keep */}
        <mesh position={[0, 1.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 2.5, 2]} />
            <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        {/* Corner Watchtowers */}
        {[[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
                <mesh position={[0, 1.5, 0]} castShadow>
                    <cylinderGeometry args={[0.5, 0.6, 3, 8]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
                <mesh position={[0, 3.2, 0]} castShadow>
                    <coneGeometry args={[0.7, 1, 8]} />
                    <meshStandardMaterial color="#1e293b" />
                </mesh>
            </group>
        ))}
        {/* Gold Crown Spires */}
        <mesh position={[0, 3.2, 0]} castShadow>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.5} />
        </mesh>
    </group>
);

export const ThreeBoard: React.FC = () => {
    const { pawns } = useGameStore();

    const cells = useMemo(() => {
        const items = [];
        for (let r = 0; r < 15; r++) {
            for (let c = 0; c < 15; c++) {
                let cellColor: string | undefined;
                let isSafe = false;

                if (r === 7 && c > 0 && c < 6) cellColor = '#ef4444'; // CRIMSON
                if (r === 6 && c === 1) cellColor = '#991b1b';
                if (c === 7 && r > 0 && r < 6) cellColor = '#3b82f6'; // SAPPHIRE
                if (r === 1 && c === 8) cellColor = '#1d4ed8';
                if (r === 7 && c > 8 && c < 14) cellColor = '#eab308'; // GOLD
                if (r === 8 && c === 13) cellColor = '#a16207';
                if (c === 7 && r > 8 && r < 14) cellColor = '#22c55e'; // EMERALD
                if (r === 13 && c === 6) cellColor = '#15803d';

                const isPath = (r >= 6 && r <= 8) || (c >= 6 && c <= 8);
                const isHome = (r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c < 6) || (r > 8 && c > 8);

                if (isHome && !isPath) continue;

                isSafe = ([6, 8].includes(r) && [2, 12].includes(c)) || ([2, 12].includes(r) && [6, 8].includes(c));

                items.push(<BoardCell key={`${r}-${c}`} r={r} c={c} color={cellColor} isSafe={isSafe} />);
            }
        }
        return items;
    }, []);

    return (
        <div className="w-full h-full min-h-[500px] overflow-hidden relative">
            <Canvas shadows className="bg-[#f1f5f9]">
                <PerspectiveCamera makeDefault position={[0, 20, 15]} fov={40} />
                <OrbitControls
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2.2}
                    minDistance={10}
                    maxDistance={40}
                />

                <ambientLight intensity={1.5} />
                <directionalLight
                    position={[20, 30, 10]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                />
                <pointLight position={[-20, 15, -20]} intensity={1} color="#fffbeb" />

                <fog attach="fog" args={['#f1f5f9', 20, 70]} />

                <group rotation={[-Math.PI / 32, 0, 0]}>
                    <DesertEnvironment />

                    {/* Bright Sand Battlefield Ground */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.21, 0]} receiveShadow>
                        <planeGeometry args={[300, 300]} />
                        <meshStandardMaterial color="#fef3c7" roughness={1} />
                    </mesh>

                    {/* Main Board Base */}
                    <mesh position={[0, -0.25, 0]} receiveShadow castShadow>
                        <boxGeometry args={[17.5, 0.4, 17.5]} />
                        <meshStandardMaterial color="#e7e5e4" roughness={0.8} />
                    </mesh>

                    {cells}

                    {/* Central Citadel */}
                    <CentralCitadel />

                    <HomeArea3D color="CRIMSON" r={0} c={0} />
                    <HomeArea3D color="SAPPHIRE" r={0} c={9} />
                    <HomeArea3D color="GOLD" r={9} c={9} />
                    <HomeArea3D color="EMERALD" r={9} c={0} />

                    {pawns.map((pawn) => (
                        <ThreePawn key={pawn.id} {...pawn} />
                    ))}
                </group>

                <Environment preset="park" />
            </Canvas>

            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(255,255,255,0.4)]" />
        </div>
    );
};

const Castle = ({ color }: { color: PlayerColor }) => {
    const baseColor = PLAYER_COLORS_3D[color];
    return (
        <group position={[0, 0.2, 0]}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.8, 1, 1.8]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
            </mesh>
            {[[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]].map(([x, z], i) => (
                <group key={i} position={[x, 0, z]}>
                    <mesh position={[0, 0.75, 0]} castShadow>
                        <cylinderGeometry args={[0.35, 0.35, 1.5, 8]} />
                        <meshStandardMaterial color="#94a3b8" />
                    </mesh>
                    <mesh position={[0, 1.6, 0]} castShadow>
                        <coneGeometry args={[0.45, 0.6, 8]} />
                        <meshStandardMaterial color={baseColor} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

const HomeArea3D = ({ color, r, c }: { color: PlayerColor, r: number, c: number }) => {
    const x = (c - 7 + 3) * SPACING - (3 * SPACING) / 2;
    const z = (r - 7 + 3) * SPACING - (3 * SPACING) / 2;

    return (
        <group position={[x, -0.05, z]}>
            <mesh receiveShadow castShadow>
                <boxGeometry args={[6.6, 0.3, 6.6]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.16, 0]}>
                <boxGeometry args={[6.2, 0.01, 6.2]} />
                <meshStandardMaterial color={PLAYER_COLORS_3D[color]} transparent opacity={0.15} />
            </mesh>
            <Castle color={color} />
        </group>
    );
};
