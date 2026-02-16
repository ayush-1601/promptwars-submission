import { GoogleGenerativeAI } from "@google/generative-ai";
import { PlayerColor } from "@/lib/game-logic";

const GEN_AI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEN_AI_KEY);

const PERSONALITIES: Record<PlayerColor, string> = {
    CRIMSON: "Aggressive, boastful, competitive, loves trash-talking.",
    SAPPHIRE: "Strategic, calm, analytical, focused on the long game.",
    EMERALD: "Impulsive, mischievous, unpredictable, loves chaos.",
    GOLD: "Friendly, supportive, optimistic, always cheering.",
};

export async function generateAvatarDescription(
    imageData: string, // base64
    mimeType: string,
    teamColor: PlayerColor,
    themePrompt: string
): Promise<string> {
    const prompt = `Analyze this image and the theme prompt: "${themePrompt}". 
    Generate a detailed 3D character description for a "Royal Ancient Battleground" Ludo game. 
    The character belongs to Team ${teamColor}.
    Describe the character's appearance, armor, magical artifacts, and "royal ancient" vibe.
    Keep it within 30 words. Result should be just the description.`;

    if (!GEN_AI_KEY) {
        return `A majestic ${teamColor} warrior inspired by the uploaded image, wielding ancient artifacts in a royal battleground.`;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageData,
                    mimeType
                }
            }
        ]);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini Avatar Generation Error:", error);
        return `The Royal ${teamColor} Sentinel, forged from the essence of your vision.`;
    }
}

export async function generateDialogue(
    color: PlayerColor,
    event: 'move' | 'capture' | 'captured' | 'home' | 'start',
    context?: string
): Promise<string> {
    const personality = PERSONALITIES[color];
    const prompt = `You are a Ludo pawn with the following personality: ${personality}. 
  You just experienced a game event: ${event}. 
  Context: ${context || 'Normal gameplay'}. 
  Give a short, punchy one-liner dialogue (max 10 words) expressing your reaction. 
  Do not use quotes or prefixes, just the dialogue itself.`;

    if (!GEN_AI_KEY) {
        // Fallback dialogue templates
        const fallbacks: Record<typeof event, string[]> = {
            move: ["Taking a step forward!", "On the move.", "Victory is closer."],
            capture: ["Gotcha!", "Move aside!", "One down, many more to go."],
            captured: ["I'll be back!", "Not again!", "This isn't over."],
            home: ["Home sweet home!", "Mission accomplished!", "I've arrived."],
            start: ["Let's do this!", "Ready for action.", "Finally out of the nest!"],
        };
        const list = fallbacks[event];
        return list[Math.floor(Math.random() * list.length)];
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini Dialogue Error:", error);
        return "Moving out!";
    }
}
