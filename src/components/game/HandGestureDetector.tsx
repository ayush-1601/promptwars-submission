"use client";

import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, VideoOff, Loader2 } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

export const HandGestureDetector: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isActive, setIsActive] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
    const { rollDice, isRolling, diceRoll } = useGameStore();
    const lastTriggerRef = useRef<number>(0);

    useEffect(() => {
        const initDetector = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );
                const landmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });
                setHandLandmarker(landmarker);
                setIsLoaded(true);
            } catch (err) {
                console.error("Hand detection init failed:", err);
            }
        };
        initDetector();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240 }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsActive(true);
            }
        } catch (err) {
            console.error("Camera access error:", err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsActive(false);
    };

    useEffect(() => {
        if (!isActive || !handLandmarker || !videoRef.current) return;

        let animationFrame: number;
        const detect = async () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
                try {
                    const startTimeMs = performance.now();
                    const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);

                    if (results.landmarks && results.landmarks.length > 0) {
                        const landmarks = results.landmarks[0];

                        // Open Palm Gesture detection
                        // Mediapipe Landmarks: 8 (index tip), 12 (middle tip), 16 (ring tip), 20 (pinky tip)
                        // Joints: 6, 10, 14, 18
                        const isFingersExtended = [8, 12, 16, 20].every(tipIdx => {
                            const tip = landmarks[tipIdx];
                            const joint = landmarks[tipIdx - 2];
                            return tip && joint && tip.y < joint.y;
                        });

                        if (isFingersExtended && !isRolling && diceRoll === null) {
                            const now = Date.now();
                            if (now - lastTriggerRef.current > 2000) {
                                rollDice();
                                lastTriggerRef.current = now;
                            }
                        }
                    }
                } catch (err) {
                    console.error("Detection loop error:", err);
                }
            }
            animationFrame = requestAnimationFrame(detect);
        };

        detect();
        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [isActive, handLandmarker, rollDice, isRolling, diceRoll]);

    return (
        <div className="fixed bottom-32 left-8 z-50 flex flex-col items-start gap-4 pointer-events-auto">
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -20 }}
                        className="relative w-48 h-36 bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                    >
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover -scale-x-100"
                        />
                        <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                        <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/40 px-2 py-1 rounded-full backdrop-blur-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[7px] font-black text-white uppercase tracking-tighter">Command Sync Active</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={isActive ? stopCamera : startCamera}
                disabled={!isLoaded}
                className={cn(
                    "flex items-center gap-3 px-6 py-4 rounded-2xl transition-all shadow-xl group",
                    isActive ? "bg-red-50 text-red-600 border-red-100" : "bg-white text-slate-900 border-slate-100",
                    "border-2 hover:scale-105 active:scale-95 disabled:opacity-50"
                )}
            >
                {!isLoaded ? (
                    <Loader2 size={18} className="animate-spin text-blue-500" />
                ) : isActive ? (
                    <VideoOff size={18} />
                ) : (
                    <Hand size={18} className="group-hover:rotate-12 transition-transform text-blue-500" />
                )}
                <span className="text-[10px] font-black uppercase tracking-widest">
                    {!isLoaded ? "Arming Sensors..." : isActive ? "Cease Tracking" : "Gesture Command"}
                </span>
            </button>
        </div>
    );
};
