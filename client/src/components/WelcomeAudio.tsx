import { useEffect, useRef } from "react";
import { WELCOME_AUDIO_STARTED_EVENT } from "@/lib/audioEvents";
import { isVoiceMuted, queueAudioVoice } from "@/lib/voicePlayback";

const WELCOME_PLAYED_SESSION_KEY = "nuit-lumiere-welcome-played";
let welcomePlayedThisDocument = false;

function hasWelcomePlayedThisSession() {
  if (welcomePlayedThisDocument) return true;
  try {
    return window.sessionStorage.getItem(WELCOME_PLAYED_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markWelcomePlayedThisSession() {
  welcomePlayedThisDocument = true;
  try {
    window.sessionStorage.setItem(WELCOME_PLAYED_SESSION_KEY, "1");
  } catch {
    // The module-level flag still prevents replay for the current document.
  }
}

export default function WelcomeAudio() {
  const player = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let playPending = false;
    const welcomePlayer = player.current;
    if (!welcomePlayer) return;

    const onPlaybackStarted = () => {
      markWelcomePlayedThisSession();
      window.removeEventListener("click", playWelcomeOnFirstClick, true);
    };
    welcomePlayer.addEventListener("play", onPlaybackStarted);

    const playWelcomeOnFirstClick = () => {
      if (hasWelcomePlayedThisSession()) {
        window.removeEventListener("click", playWelcomeOnFirstClick, true);
        return;
      }

      if (isVoiceMuted()) return;
      if (playPending) {
        if (!welcomePlayer.paused || hasWelcomePlayedThisSession()) return;
        playPending = false;
      }

      playPending = true;
      window.dispatchEvent(new Event(WELCOME_AUDIO_STARTED_EVENT));
      queueAudioVoice("welcome", welcomePlayer, {
        restart: true,
        volume: 1,
        onBlocked: () => {
          playPending = false;
        },
      });
    };

    window.addEventListener("click", playWelcomeOnFirstClick, true);
    return () => {
      window.removeEventListener("click", playWelcomeOnFirstClick, true);
      welcomePlayer.removeEventListener("play", onPlaybackStarted);
    };
  }, []);

  return <audio ref={player} src="/media/nuit-lumiere-welcome-velvet.mp3" preload="auto" hidden />;
}
