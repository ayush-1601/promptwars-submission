"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PlayerColor, PLAYER_COLORS } from '@/lib/game-logic';
import { cn } from '@/lib/utils';
import { generateDialogue } from '@/services/gemini';

interface ThemeSetupProps {
    onComplete: (themes: Record<PlayerColor, string>) => void;
}

export const ThemeSetup: React.FC<ThemeSetupProps> = ({ onComplete }) => {
    const [step, setStep] = useState<number>(0);
    const [themes, setThemes] = useState<Record<PlayerColor, string>>({
        RED: 'Aggressive Space Explorers',
        BLUE: 'Strategic Deep Sea Creatures',
        YELLOW: 'Friendly Forest Spirits',
        GREEN: 'Mischievous Desert Bandits',
    });
    const [loading, setLoading] = useState<boolean>(false);

    const colors: PlayerColor[] = PLAYER_COLORS;
    const currentColor = colors[step];

    const handleNext = () => {
        if (step < colors.length - 1) {
            setStep(step + 1);
        } else {
            onComplete(themes);
        }
    };

    const generateThemeDescription = async () => {
        setLoading(true);
        // Simulate Gemini generating a detailed theme description
        setTimeout(() => {
            setLoading(false);
            handleNext();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
            {/* Background Polish */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-2xl bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col gap-8"
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-400">
                            Pawn Genesis
                        </h2>
                    </div>
                    <h1 className="text-4xl font-black text-white">
                        Define Team <span className={cn("inline-block", {
                            'text-red-500': currentColor === 'RED',
                            'text-blue-500': currentColor === 'BLUE',
                            'text-yellow-400': currentColor === 'YELLOW',
                            'text-green-500': currentColor === 'GREEN',
                        })}>{currentColor}</span>
                    </h1>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Gemini Theme Prompt
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={themes[currentColor]}
                                onChange={(e) => setThemes({ ...themes, [currentColor]: e.target.value })}
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all text-lg font-medium"
                                placeholder="Ex: Tiny space explorers with jetpacks..."
                            />
                            <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={20} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 group hover:border-blue-500/30 transition-all cursor-pointer">
                            <div className="bg-slate-900 p-3 rounded-full text-slate-600 group-hover:text-blue-500 transition-colors">
                                <Upload size={24} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-300">
                                Upload Ref Image
                            </span>
                        </div>

                        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400">
                                <CheckCircle2 size={24} />
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Gemini will analyze your prompt and image to generate 4 sentient 3D avatars for your team.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                    <div className="flex gap-2">
                        {colors.map((c, i) => (
                            <div
                                key={c}
                                className={cn("w-12 h-1.5 rounded-full transition-all duration-500",
                                    i < step ? "bg-blue-500" : i === step ? "bg-slate-400 w-16" : "bg-slate-800"
                                )}
                            />
                        ))}
                    </div>

                    <button
                        disabled={loading}
                        onClick={generateThemeDescription}
                        className="group bg-blue-500 hover:bg-blue-400 text-slate-950 px-8 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-3 transition-all disabled:opacity-50"
                    >
                        {loading ? "Generating..." : step === colors.length - 1 ? "Begin Battle" : "Next Team"}
                        {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
