import { useEffect, useRef } from "react";
import {
  cancelVoice,
  isVoiceMuted,
  queueAudioVoice,
} from "@/lib/voicePlayback";

const VOICE_KEY = "for-him-caption";

export default function ForHimNarration() {
  const player = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = player.current;
    if (!audio) return;

    let disposed = false;
    let requestPending = false;
    let retryListenerActive = false;
    let retryTimer: number | null = null;

    const removeRetryListeners = () => {
      window.removeEventListener("click", onUserGesture, true);
      window.removeEventListener("keydown", onUserGesture, true);
      retryListenerActive = false;
    };

    const onUserGesture = () => {
      removeRetryListeners();
      retryTimer = window.setTimeout(startNarration, 0);
    };

    const waitForUserGesture = () => {
      if (disposed || retryListenerActive) return;
      retryListenerActive = true;
      window.addEventListener("click", onUserGesture, { capture: true, once: true });
      window.addEventListener("keydown", onUserGesture, { capture: true, once: true });
    };

    const startNarration = () => {
      if (disposed || requestPending || isVoiceMuted()) return;
      requestPending = true;
      queueAudioVoice(VOICE_KEY, audio, {
        restart: true,
        volume: 0.25,
        playbackRate: 1.15,
        onBlocked: () => {
          requestPending = false;
          waitForUserGesture();
        },
      });
    };

    startNarration();
    return () => {
      disposed = true;
      removeRetryListeners();
      if (retryTimer !== null) window.clearTimeout(retryTimer);
      cancelVoice(VOICE_KEY);
    };
  }, []);

  return (
    <audio
      ref={player}
      src="/media/for-him-line.mp3"
      preload="auto"
      hidden
    />
  );
}
