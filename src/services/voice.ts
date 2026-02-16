"use client";

import { PlayerColor } from '@/lib/game-logic';

const VOICE_SETTINGS: Record<PlayerColor, { rate: number; pitch: number; volume: number }> = {
    CRIMSON: { rate: 1.2, pitch: 0.8, volume: 1.0 },    // Aggressive, deep
    SAPPHIRE: { rate: 0.9, pitch: 1.0, volume: 0.8 },   // Strategic, calm
    EMERALD: { rate: 1.5, pitch: 1.2, volume: 1.0 },    // Impulsive, high-pitched
    GOLD: { rate: 1.1, pitch: 1.4, volume: 0.9 },      // Friendly, cheerful
};

class VoiceService {
    private synthesis: SpeechSynthesis | null = null;
    private voices: SpeechSynthesisVoice[] = [];

    constructor() {
        if (typeof window !== 'undefined') {
            this.synthesis = window.speechSynthesis;
            this.loadVoices();
        }
    }

    private loadVoices() {
        if (!this.synthesis) return;
        this.voices = this.synthesis.getVoices();
        if (this.voices.length === 0) {
            this.synthesis.onvoiceschanged = () => {
                this.voices = this.synthesis!.getVoices();
            };
        }
    }

    speak(text: string, color: PlayerColor) {
        if (!this.synthesis) return;

        // Cancel any current speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const settings = VOICE_SETTINGS[color];

        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;

        // Try to find a suitable voice
        const preferredVoice = this.voices.find(v => v.lang.includes('en-GB')) || this.voices[0];
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        this.synthesis.speak(utterance);
    }
}

export const voiceService = new VoiceService();
