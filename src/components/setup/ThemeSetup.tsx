"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, ArrowRight, CheckCircle2, ShieldCheck, Camera, X } from 'lucide-react';
import { PlayerColor, PLAYER_COLORS } from '@/lib/game-logic';
import { cn } from '@/lib/utils';
import { generateDialogue, generateAvatarDescription } from '@/services/gemini';

interface ThemeSetupProps {
    onComplete: (themes: Record<PlayerColor, string>) => void;
}

export const ThemeSetup: React.FC<ThemeSetupProps> = ({ onComplete }) => {
    const [step, setStep] = useState<number>(0);
    const [themes, setThemes] = useState<Record<PlayerColor, string>>({
        CRIMSON: 'Brutal Desert Warlords',
        SAPPHIRE: 'Echoing Canyon Guardians',
        GOLD: 'Ancient Oasis Sentinels',
        EMERALD: 'Nomadic Storm Raiders',
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const colors: PlayerColor[] = PLAYER_COLORS;
    const currentColor = colors[step];

    const playerConfigs: Record<PlayerColor, { name: string, detail: string, icon: any }> = {
        CRIMSON: { name: 'CRIMSON LEGION', detail: 'Masters of brute force and fire.', icon: ShieldCheck },
        SAPPHIRE: { name: 'SAPPHIRE ORDER', detail: 'Silent watchers of the depths.', icon: Sparkles },
        GOLD: { name: 'GOLDEN REALM', detail: 'Keepers of the ancient sun.', icon: CheckCircle2 },
        EMERALD: { name: 'EMERALD TRIBES', detail: 'Swift riders of the storm.', icon: Upload },
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch (err) {
            console.error("Camera access error:", err);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.error("Video dimensions not ready");
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'captured.jpg', { type: 'image/jpeg' });
                setImageFile(file);
                stopCamera();
            }
        }, 'image/jpeg');
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    const handleNext = () => {
        if (step < colors.length - 1) {
            setStep(step + 1);
            setImageFile(null);
        } else {
            onComplete(themes);
        }
    };

    const generateThemeDescription = async () => {
        setLoading(true);
        try {
            if (imageFile) {
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(imageFile);
                });
                const description = await generateAvatarDescription(base64, imageFile.type, currentColor, themes[currentColor]);
                setThemes(prev => ({ ...prev, [currentColor]: description }));
            }
            await new Promise(r => setTimeout(r, 1200));
            handleNext();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const currentConfig = playerConfigs[currentColor];

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden font-sans text-slate-900">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            {cameraActive && (
                <div className="fixed inset-0 z-[200] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
                    <video ref={videoRef} autoPlay playsInline className="w-full max-w-2xl rounded-[2rem] border-8 border-slate-100 shadow-2xl" />
                    <div className="flex gap-6 mt-12">
                        <button onClick={capturePhoto} className="bg-slate-950 text-white p-8 rounded-full hover:scale-110 transition-transform shadow-xl">
                            <Camera size={40} />
                        </button>
                        <button onClick={stopCamera} className="bg-slate-200 text-slate-600 p-8 rounded-full hover:bg-slate-300 transition-colors">
                            <X size={40} />
                        </button>
                    </div>
                </div>
            )}

            {/* Header Steps */}
            <div className="relative z-10 w-full max-w-4xl flex gap-2 mb-12">
                {colors.map((c, i) => (
                    <div key={c} className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden relative">
                        <motion.div
                            initial={false}
                            animate={{ width: i <= step ? '100%' : '0%' }}
                            className={cn("absolute inset-0", {
                                'bg-red-500': c === 'CRIMSON',
                                'bg-blue-500': c === 'SAPPHIRE',
                                'bg-yellow-400': c === 'GOLD',
                                'bg-green-500': c === 'EMERALD',
                            })}
                        />
                    </div>
                ))}
            </div>

            <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1fr_400px] gap-12"
            >
                {/* Visualizer / Preview Area */}
                <div className="bg-white/70 backdrop-blur-xl border border-black/[0.03] rounded-[3.5rem] p-12 flex flex-col justify-between items-center text-center gap-8 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white to-transparent pointer-events-none" />

                    <div className="space-y-4 pt-12 relative z-10">
                        <div className="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">Recruitment Protocol</div>
                        <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                            {currentConfig.name}
                        </h1>
                        <p className="text-slate-500 font-medium max-w-md mx-auto">{currentConfig.detail}</p>
                    </div>

                    <div className="w-full space-y-8 pb-12 relative z-10">
                        <div className="relative group max-w-lg mx-auto">
                            <input
                                type="text"
                                value={themes[currentColor]}
                                onChange={(e) => setThemes({ ...themes, [currentColor]: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-6 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-blue-500/20 transition-all text-xl font-bold text-center"
                                placeholder="Define your legion theme..."
                            />
                            <div className="absolute inset-0 -z-10 bg-blue-500/5 blur-xl group-focus-within:bg-blue-500/10 transition-all" />
                        </div>

                        <div className="flex gap-4 justify-center">
                            <label className="flex items-center gap-3 bg-white hover:bg-slate-50 px-6 py-4 rounded-2xl cursor-pointer transition-all border border-slate-100 shadow-sm">
                                <Upload size={18} className="text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Upload Intel</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                            </label>
                            <button
                                onClick={startCamera}
                                className="flex items-center gap-3 bg-white hover:bg-slate-50 px-6 py-4 rounded-2xl transition-all border border-slate-100 shadow-sm"
                            >
                                <Camera size={18} className="text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Live Recon</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status / Proceed Area */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white/80 backdrop-blur-xl border border-black/[0.03] rounded-[3rem] p-8 space-y-6 flex-1 shadow-xl">
                        <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden relative border border-slate-100 shadow-inner">
                            {imageFile ? (
                                <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" alt="Source" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-4">
                                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Intel</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Genesis Status</h3>
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-mono uppercase font-bold tracking-tighter">Synchronized</span>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl text-[11px] text-slate-500 font-medium leading-relaxed italic border border-slate-100">
                                {loading ? "Analyzing battlefield intel & forging sentinel spirits..." : "Provide an artifact or recon image to synchronize the legion's visual soul."}
                            </div>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        onClick={generateThemeDescription}
                        className="w-full h-24 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-4 group"
                    >
                        {loading ? <div className="animate-spin text-2xl">⚡</div> : step === colors.length - 1 ? "End Recruitment" : "Synchronize"}
                        {!loading && <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />}
                    </button>
                </div>
            </motion.div>

            {/* Bottom Credits / Instructions */}
            <div className="mt-12 text-[9px] font-black text-slate-300 uppercase tracking-[0.6em] relative z-10 text-center">
                Legion Selection Phase • Light Protocol Alpha-1
            </div>
        </div>
    );
};
