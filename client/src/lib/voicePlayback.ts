export type VoicePlaybackStarter = (finish: () => void) => void | (() => void);

type VoiceRequest = {
  key: string;
  start: VoicePlaybackStarter;
};

type ActiveVoice = {
  request: VoiceRequest;
  cleanup?: () => void;
};

let activeVoice: ActiveVoice | null = null;
let queuedVoices: VoiceRequest[] = [];
let voicesMuted = false;

function startNextVoice() {
  if (activeVoice || voicesMuted) return;
  const request = queuedVoices.shift();
  if (!request) return;

  const active: ActiveVoice = { request };
  activeVoice = active;
  const finish = () => {
    if (activeVoice !== active) return;
    activeVoice = null;
    window.setTimeout(startNextVoice, 0);
  };

  try {
    const cleanup = request.start(finish);
    if (activeVoice === active && typeof cleanup === "function") {
      active.cleanup = cleanup;
    }
  } catch {
    finish();
  }
}

export function isVoiceMuted() {
  return voicesMuted;
}

export function queueVoice(key: string, start: VoicePlaybackStarter) {
  if (voicesMuted) return () => undefined;
  if (activeVoice?.request.key === key || queuedVoices.some(item => item.key === key)) {
    return () => cancelQueuedVoice(key);
  }

  queuedVoices.push({ key, start });
  startNextVoice();
  return () => cancelQueuedVoice(key);
}

export function cancelQueuedVoice(key: string) {
  queuedVoices = queuedVoices.filter(request => request.key !== key);
}

export function cancelQueuedVoicesWithPrefix(prefix: string) {
  queuedVoices = queuedVoices.filter(request => !request.key.startsWith(prefix));
}

export function cancelVoicesWithPrefix(prefix: string) {
  cancelQueuedVoicesWithPrefix(prefix);
  const active = activeVoice;
  if (!active?.request.key.startsWith(prefix)) return;
  activeVoice = null;
  active.cleanup?.();
  window.setTimeout(startNextVoice, 0);
}

export function releaseVoice(key: string) {
  if (activeVoice?.request.key !== key) return;
  activeVoice = null;
  window.setTimeout(startNextVoice, 0);
}

export function cancelVoice(key: string) {
  cancelQueuedVoice(key);
  const active = activeVoice;
  if (active?.request.key !== key) return;
  activeVoice = null;
  active.cleanup?.();
  window.setTimeout(startNextVoice, 0);
}

export function setVoiceMuted(muted: boolean) {
  voicesMuted = muted;
  if (muted) {
    queuedVoices = [];
    const active = activeVoice;
    activeVoice = null;
    active?.cleanup?.();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    return;
  }
  startNextVoice();
}

type AudioVoiceOptions = {
  restart?: boolean;
  volume?: number;
  playbackRate?: number;
  onBlocked?: () => void;
};

export function queueAudioVoice(
  key: string,
  audio: HTMLAudioElement,
  options: AudioVoiceOptions = {}
) {
  return queueVoice(key, finish => {
    if (voicesMuted) {
      finish();
      return;
    }

    if (options.restart ?? true) audio.currentTime = 0;
    audio.volume = options.volume ?? 0.42;
    audio.playbackRate = options.playbackRate ?? 1;
    let settled = false;

    const cleanupListeners = () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("pause", onPause);
    };
    const done = () => {
      if (settled) return;
      settled = true;
      cleanupListeners();
      finish();
    };
    const onEnded = () => done();
    const onError = () => done();
    const onPause = () => {
      if (!audio.ended) done();
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("pause", onPause);

    try {
      const playback = audio.play();
      if (playback) {
        void playback.catch(error => {
          if (error instanceof DOMException && error.name === "NotAllowedError") {
            options.onBlocked?.();
          }
          done();
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        options.onBlocked?.();
      }
      done();
    }

    return () => {
      if (settled) return;
      settled = true;
      cleanupListeners();
      audio.pause();
    };
  });
}
