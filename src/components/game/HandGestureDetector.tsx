"use client";

import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, VideoOff, Loader2, Zap } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

export const HandGestureDetector: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isActive, setIsActive] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [handDetected, setHandDetected] = useState(false);
    const [gestureDetected, setGestureDetected] = useState(false);
    const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
    const { rollDice, isRolling, diceRoll } = useGameStore();
    const lastTriggerRef = useRef<number>(0);
    const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    const [stream, setStream] = useState<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            setStream(userStream);
            setIsActive(true);
        } catch (err) {
            console.error("Camera access error:", err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsActive(false);
        setHandDetected(false);
        setGestureDetected(false);
    };

    // Attach stream to video element when it's rendered
    useEffect(() => {
        if (isActive && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [isActive, stream]);

    useEffect(() => {
        if (!isActive || !handLandmarker || !videoRef.current || !stream) return;

        let animationFrame: number;
        const detect = async () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
                try {
                    const startTimeMs = performance.now();
                    const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);

                    // Draw landmarks on canvas
                    if (canvasRef.current && videoRef.current) {
                        const canvas = canvasRef.current;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);

                            if (results.landmarks && results.landmarks.length > 0) {
                                const landmarks = results.landmarks[0];

                                // Draw hand skeleton
                                ctx.strokeStyle = '#3b82f6';
                                ctx.lineWidth = 3;
                                ctx.fillStyle = '#3b82f6';

                                // Draw connections
                                const connections = [
                                    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
                                    [0, 5], [5, 6], [6, 7], [7, 8], // Index
                                    [0, 9], [9, 10], [10, 11], [11, 12], // Middle
                                    [0, 13], [13, 14], [14, 15], [15, 16], // Ring
                                    [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
                                    [5, 9], [9, 13], [13, 17] // Palm
                                ];

                                connections.forEach(([start, end]) => {
                                    const startPoint = landmarks[start];
                                    const endPoint = landmarks[end];
                                    ctx.beginPath();
                                    ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
                                    ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
                                    ctx.stroke();
                                });

                                // Draw landmarks
                                landmarks.forEach((landmark) => {
                                    ctx.beginPath();
                                    ctx.arc(
                                        landmark.x * canvas.width,
                                        landmark.y * canvas.height,
                                        5,
                                        0,
                                        2 * Math.PI
                                    );
                                    ctx.fill();
                                });
                            }
                        }
                    }

                    if (results.landmarks && results.landmarks.length > 0) {
                        setHandDetected(true);
                        const landmarks = results.landmarks[0];

                        // Open Palm Gesture detection
                        // Check if all fingers are extended (y coordinate of tip < y coordinate of joint)
                        const isFingersExtended = [8, 12, 16, 20].every(tipIdx => {
                            const tip = landmarks[tipIdx];
                            const joint = landmarks[tipIdx - 2];
                            return tip && joint && tip.y < joint.y;
                        });

                        // Also check thumb
                        const thumbExtended = landmarks[4].x < landmarks[3].x;

                        const isOpenPalm = isFingersExtended && thumbExtended;

                        if (isOpenPalm) {
                            setGestureDetected(true);

                            // Clear existing timeout
                            if (gestureTimeoutRef.current) {
                                clearTimeout(gestureTimeoutRef.current);
                            }

                            // Reset gesture detected after 500ms
                            gestureTimeoutRef.current = setTimeout(() => {
                                setGestureDetected(false);
                            }, 500);

                            // Trigger dice roll if conditions are met
                            if (!isRolling && diceRoll === null) {
                                const now = Date.now();
                                if (now - lastTriggerRef.current > 2000) {
                                    console.log("🎲 Hand gesture detected! Rolling dice...");
                                    rollDice();
                                    lastTriggerRef.current = now;
                                }
                            }
                        } else {
                            setGestureDetected(false);
                        }
                    } else {
                        setHandDetected(false);
                        setGestureDetected(false);
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
            if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
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
                        className="relative w-64 h-48 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                    >
                        {/* Video Feed */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-80"
                        />

                        {/* Canvas for hand landmarks */}
                        <canvas
                            ref={canvasRef}
                            width={640}
                            height={480}
                            className="absolute inset-0 w-full h-full -scale-x-100"
                        />

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                        {/* Status indicators */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2">
                            {/* Camera Active */}
                            <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[8px] font-black text-white uppercase tracking-wider">Live</span>
                            </div>

                            {/* Hand Detection Status */}
                            <AnimatePresence>
                                {handDetected && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-colors",
                                            gestureDetected
                                                ? "bg-green-500/90 shadow-lg shadow-green-500/50"
                                                : "bg-blue-500/60"
                                        )}
                                    >
                                        {gestureDetected && (
                                            <Zap size={12} className="text-white animate-pulse" />
                                        )}
                                        <Hand size={12} className="text-white" />
                                        <span className="text-[8px] font-black text-white uppercase tracking-wider">
                                            {gestureDetected ? "Fire!" : "Detected"}
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Instruction text */}
                        <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-black/60 px-3 py-2 rounded-2xl backdrop-blur-md">
                                <p className="text-[9px] font-bold text-white text-center leading-tight">
                                    Show open palm ✋ to roll dice
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={isActive ? stopCamera : startCamera}
                disabled={!isLoaded}
                className={cn(
                    "flex items-center gap-3 px-6 py-4 rounded-2xl transition-all shadow-xl group",
                    isActive ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-900 border-slate-200",
                    "border-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
