import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import {
  cancelVoice,
  isVoiceMuted,
  queueAudioVoice,
  releaseVoice,
} from "@/lib/voicePlayback";

type AboutNarrationProps = {
  className?: string;
};

const VOICE_KEY = "about-story";

/** Accessible playback control for the locally bundled About narration. */
export default function AboutNarration({
  className = "",
}: AboutNarrationProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const requestPlayback = useRef<(restart: boolean) => void>(() => undefined);

  useEffect(() => {
    const audio = audioRef.current;
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
      retryTimer = window.setTimeout(() => attemptPlayback(false), 0);
    };
    const waitForUserGesture = () => {
      if (disposed || retryListenerActive) return;
      retryListenerActive = true;
      window.addEventListener("click", onUserGesture, { capture: true, once: true });
      window.addEventListener("keydown", onUserGesture, { capture: true, once: true });
    };
    const onPlaybackStarted = () => {
      setPlaying(true);
      removeRetryListeners();
    };
    const onPlaybackStopped = () => setPlaying(false);
    const attemptPlayback = (restart: boolean) => {
      if (disposed || requestPending || isVoiceMuted()) return;
      requestPending = true;
      queueAudioVoice(VOICE_KEY, audio, {
        restart,
        volume: 0.25,
        onBlocked: () => {
          requestPending = false;
          waitForUserGesture();
        },
      });
    };

    requestPlayback.current = attemptPlayback;
    audio.addEventListener("play", onPlaybackStarted);
    audio.addEventListener("pause", onPlaybackStopped);
    audio.addEventListener("ended", onPlaybackStopped);
    attemptPlayback(true);

    return () => {
      disposed = true;
      requestPlayback.current = () => undefined;
      removeRetryListeners();
      if (retryTimer !== null) window.clearTimeout(retryTimer);
      audio.removeEventListener("play", onPlaybackStarted);
      audio.removeEventListener("pause", onPlaybackStopped);
      audio.removeEventListener("ended", onPlaybackStopped);
      cancelVoice(VOICE_KEY);
    };
  }, []);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      releaseVoice(VOICE_KEY);
      return;
    }
    requestPlayback.current(audio.ended || audio.currentTime === 0);
  };

  return (
    <div className={`about-narration ${className}`.trim()}>
      <button
        type="button"
        className="about-narration-button"
        onClick={togglePlayback}
        aria-pressed={playing}
      >
        {playing ? (
          <Pause size={16} strokeWidth={1.5} />
        ) : (
          <Play size={16} strokeWidth={1.5} />
        )}
        <span>{playing ? "Pause narration" : "Listen to the story"}</span>
      </button>
      <audio
        ref={audioRef}
        src="/media/about-story.mp3"
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        hidden
      />
    </div>
  );
}
