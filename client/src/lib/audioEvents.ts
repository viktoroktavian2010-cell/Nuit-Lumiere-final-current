export type MirrorMoodId = "sun" | "rain" | "night";

export const VOICE_GUIDE_EVENT = "nuit-lumiere:voice-guide";
export const WELCOME_AUDIO_STARTED_EVENT = "nuit-lumiere:welcome-audio-started";
export const MIRROR_MOOD_AUDIO_EVENT = "nuit-lumiere:mirror-mood-audio";
export const STOP_MIRROR_AUDIO_EVENT = "nuit-lumiere:stop-mirror-audio";

export function requestVoiceGuide(text: string, productSlug?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(VOICE_GUIDE_EVENT, { detail: { text, productSlug } }));
}

export function requestMirrorMoodAudio(mood: MirrorMoodId) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MIRROR_MOOD_AUDIO_EVENT, { detail: mood }));
}

export function stopMirrorMoodAudio() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STOP_MIRROR_AUDIO_EVENT));
}
