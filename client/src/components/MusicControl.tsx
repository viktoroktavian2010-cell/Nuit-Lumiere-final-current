import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Mic, MicOff, Music2, Pause, Play, Volume2, VolumeX, Waves } from "lucide-react";
import {
  MIRROR_MOOD_AUDIO_EVENT,
  STOP_MIRROR_AUDIO_EVENT,
  VOICE_GUIDE_EVENT,
  WELCOME_AUDIO_STARTED_EVENT,
  type MirrorMoodId,
} from "@/lib/audioEvents";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import {
  cancelQueuedVoicesWithPrefix,
  cancelVoicesWithPrefix,
  isVoiceMuted,
  queueVoice,
  setVoiceMuted as setGlobalVoiceMuted,
} from "@/lib/voicePlayback";
import "./MusicControl.css";

const DEFAULT_VOLUME = 0.02;
const FADE_IN_DURATION_MS = 3000;
const MIRROR_FADE_IN_MS = 1600;
const MIRROR_VOLUME = 0.14;
let backgroundMusicPlayer: HTMLAudioElement | null = null;

function getBackgroundMusicPlayer() {
  if (typeof window === "undefined") return null;
  if (!backgroundMusicPlayer) {
    backgroundMusicPlayer = document.createElement("audio");
    backgroundMusicPlayer.src = "/media/nuit-lumiere-theme.mp3";
    backgroundMusicPlayer.loop = true;
    backgroundMusicPlayer.preload = "none";
  }
  return backgroundMusicPlayer;
}

const PRODUCT_VOICE_TEXT: Record<string, Partial<Record<Language, string>>> = {
  "chanel-no5": {
    ru: "Вневременная цветочно-альдегидная композиция, в которой яркие цитрусовые ноты уравновешены нежной розой, жасмином и тёплым пудровым шлейфом.",
    ua: "Позачасова квітково-альдегідна композиція, у якій яскраві цитрусові ноти врівноважують ніжні троянда, жасмин і теплий пудровий шлейф.",
  },
  aventus: {
    ru: "Свежие фрукты и хрустящие древесные ноты сменяются уверенным дымным аккордом с мягким и стойким шлейфом.",
    ua: "Свіжі фрукти й виразні деревні ноти переходять у впевнений димний акорд із м’яким і стійким шлейфом.",
  },
  "baccarat-rouge-540": {
    ru: "Воздушный шафран и сияющая амбровая древесина создают лучистый, нежно-сладкий аромат с удивительной выразительностью.",
    ua: "Невагомий шафран і сяйлива амброва деревина створюють променистий, ніжно-солодкий аромат із дивовижною виразністю.",
  },
  "black-orchid": {
    ru: "Тёмный, роскошный цветочный аккорд с насыщенными пряностями, бархатными лепестками и глубокой землистой основой.",
    ua: "Темний, розкішний квітковий акорд із насиченими прянощами, оксамитовими пелюстками й глибокою землистою основою.",
  },
  sauvage: {
    ru: "Бодрящий бергамот и ароматная свежесть встречаются с минеральными древесными нотами, создавая свежий современный фужерный характер.",
    ua: "Бадьорий бергамот і ароматна свіжість поєднуються з мінеральними деревними нотами, створюючи свіжий сучасний фужерний характер.",
  },
  jadore: {
    ru: "Золотистый букет из иланг-иланга, розы и жасмина, воплощённый в элегантном и лучистом цветочном аромате.",
    ua: "Золотавий букет із іланг-ілангу, троянди та жасмину, втілений в елегантному й променистому квітковому ароматі.",
  },
  flowerbomb: {
    ru: "Пышное цветочное буйство жасмина и розы смягчено тёплым пачули и сладкой, обволакивающей основой.",
    ua: "Щедре квіткове буяння жасмину й троянди пом’якшують теплі пачулі та солодка, огортальна основа.",
  },
  "la-vie-est-belle": {
    ru: "Ирис и нежные цветочные ноты раскрываются на уютном гурманском аккорде ванили, пралине и древесины.",
    ua: "Ірис і ніжні квіткові ноти розкриваються на затишному гурманському акорді ванілі, праліне й деревини.",
  },
  "terre-dhermes": {
    ru: "Яркий апельсин и перец встречаются с сухим кедром и минеральными нотами, создавая сдержанный, самобытный древесный аромат.",
    ua: "Яскравий апельсин і перець поєднуються із сухим кедром та мінеральними нотами, створюючи стриманий, самобутній деревний аромат.",
  },
  shalimar: {
    ru: "Легендарная амбровая композиция: искрящиеся цитрусовые ноты уступают место дымной ванили, ладану и мягкой коже.",
    ua: "Легендарна амброва композиція: іскристі цитрусові ноти поступаються місцем димній ванілі, ладану й м’якій шкірі.",
  },
  "black-opium": {
    ru: "Яркий кофе и белые цветы соединяются с ванилью, создавая энергичный, тёплый и притягательный вечерний аромат.",
    ua: "Яскрава кава й білі квіти поєднуються з ваніллю, створюючи енергійний, теплий і чарівний вечірній аромат.",
  },
  libre: {
    ru: "Лаванда и цветы апельсина сочетаются с мягким теплом ванили, создавая уверенный контраст ароматных и цветочных нот.",
    ua: "Лаванда й квіти апельсина поєднуються з м’яким теплом ванілі, створюючи виразний контраст ароматичних і квіткових нот.",
  },
};

function splitSpeechAtNaturalPauses(text: string) {
  const chunks = text.match(/[^,;:.!?]+[,;:.!?]+|[^,;:.!?]+$/g);
  return chunks?.map((chunk) => chunk.trim()).filter(Boolean) ?? [text.trim()];
}

// Mixkit's free sound-effect preview URLs: morning birds, light rain loop, and summer-night crickets.
const MIRROR_AMBIENCE_URLS: Record<MirrorMoodId, string> = {
  sun: "https://assets.mixkit.co/active_storage/sfx/2472/2472-preview.mp3",
  rain: "https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3",
  night: "https://assets.mixkit.co/active_storage/sfx/1789/1789-preview.mp3",
};

let voiceGuideSequence = 0;

export function MusicControl() {
  const { language } = useLanguage();
  const [location] = useLocation();
  const pagePath = location.split(/[?#]/, 1)[0];
  const audio = useRef<HTMLAudioElement | null>(getBackgroundMusicPlayer());
  const mirrorAudio = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(DEFAULT_VOLUME);
  const mutedRef = useRef(false);
  const startingRef = useRef(false);
  const ignorePlayClickRef = useRef(false);
  const voiceMutedRef = useRef(isVoiceMuted());
  const ambienceMutedRef = useRef(false);
  const fadeProgress = useRef(1);
  const fadeFrame = useRef<number | null>(null);
  const mirrorFadeFrame = useRef<number | null>(null);
  const [playing, setPlaying] = useState(() => Boolean(audio.current && !audio.current.paused));
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(isVoiceMuted());
  const [ambienceMuted, setAmbienceMuted] = useState(false);
  const [ambienceActive, setAmbienceActive] = useState(false);

  useEffect(() => {
    cancelVoicesWithPrefix("voice-guide:");
    return () => cancelVoicesWithPrefix("voice-guide:");
  }, [pagePath]);

  const startPlayback = useCallback(async () => {
    const player = audio.current;
    if (!player) return;
    if (!player.paused) {
      setPlaying(true);
      return;
    }
    if (startingRef.current) return;

    startingRef.current = true;
    if (fadeFrame.current !== null) cancelAnimationFrame(fadeFrame.current);
    fadeFrame.current = null;
    fadeProgress.current = 0;
    player.muted = mutedRef.current;
    player.volume = 0;

    try {
      await player.play();
      setPlaying(true);
    } catch {
      startingRef.current = false;
      fadeProgress.current = 1;
      player.volume = volumeRef.current;
      setPlaying(false);
      return;
    }
    startingRef.current = false;

    const startedAt = performance.now();
    const fadeIn = (now: number) => {
      const currentPlayer = audio.current;
      if (!currentPlayer || currentPlayer.paused) {
        fadeFrame.current = null;
        return;
      }
      const progress = Math.min((now - startedAt) / FADE_IN_DURATION_MS, 1);
      fadeProgress.current = progress;
      currentPlayer.volume = Math.max(0, Math.min(1, volumeRef.current * progress));
      if (progress < 1) fadeFrame.current = requestAnimationFrame(fadeIn);
      else {
        fadeProgress.current = 1;
        fadeFrame.current = null;
      }
    };
    fadeFrame.current = requestAnimationFrame(fadeIn);
  }, []);

  const speak = useCallback((text: string, productSlug?: string) => {
    const cleanText = text.trim();
    if (!cleanText || isVoiceMuted() || typeof window === "undefined" ||
      !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return false;
    const translatedText = language === "en" ? cleanText : PRODUCT_VOICE_TEXT[productSlug ?? ""]?.[language] ?? cleanText;
    const speechChunks = splitSpeechAtNaturalPauses(translatedText);
    const speechLanguage = language === "ru" ? "ru-RU" : language === "ua" ? "uk-UA" : "en-US";
    const voices = window.speechSynthesis.getVoices();
    const feminineVoiceName = language === "ru"
      ? /\b(samantha|ava|allison|victoria|karen|moira|tessa|fiona|susan|zira|aria|jenny|michelle|sara|irina|milena|tatiana|tatyana|yulia|ulia|anna|olga|katya|female|woman)\b/i
      : language === "ua"
        ? /\b(samantha|ava|allison|victoria|karen|moira|tessa|fiona|susan|zira|aria|jenny|michelle|sara|irina|milena|yulia|ulia|anna|olga|kateryna|polina|female|woman)\b/i
        : /\b(samantha|ava|allison|victoria|karen|moira|tessa|fiona|susan|zira|aria|jenny|michelle|sara|female|woman)\b/i;
    const speechLocale = speechLanguage.slice(0, 2).toLowerCase();
    const localeVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith(speechLocale));
    const preferredVoice = localeVoices.find((voice) =>
      /\b(samantha|victoria|google uk english female)\b/i.test(voice.name),
    ) ?? localeVoices.find((voice) => feminineVoiceName.test(voice.name)) ?? localeVoices[0];

    cancelQueuedVoicesWithPrefix("voice-guide:");
    const voiceKey = `voice-guide:${++voiceGuideSequence}`;
    queueVoice(voiceKey, finish => {
      let chunkIndex = 0;
      let chunkTimer: number | null = null;
      let cancelled = false;
      const speakNextChunk = () => {
        if (cancelled || isVoiceMuted() || chunkIndex >= speechChunks.length) {
          finish();
          return;
        }
        const utterance = new SpeechSynthesisUtterance(speechChunks[chunkIndex]);
        chunkIndex += 1;
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.lang = speechLanguage;
        utterance.rate = 0.65;
        utterance.pitch = 0.7;
        utterance.volume = 0.15;
        const continueSpeech = () => {
          if (cancelled) return;
          if (chunkIndex < speechChunks.length) {
            chunkTimer = window.setTimeout(speakNextChunk, 240);
          } else {
            finish();
          }
        };
        utterance.onend = continueSpeech;
        utterance.onerror = continueSpeech;
        window.speechSynthesis.speak(utterance);
      };
      speakNextChunk();
      return () => {
        cancelled = true;
        if (chunkTimer !== null) window.clearTimeout(chunkTimer);
        window.speechSynthesis.cancel();
      };
    });
    return true;
  }, [language]);

  const playMirrorAmbience = useCallback((event: Event) => {
    const mood = (event as CustomEvent<MirrorMoodId>).detail;
    const source = MIRROR_AMBIENCE_URLS[mood];
    const player = mirrorAudio.current;
    if (!source || !player) return;

    if (mirrorFadeFrame.current !== null) cancelAnimationFrame(mirrorFadeFrame.current);
    mirrorFadeFrame.current = null;
    player.pause();
    player.src = source;
    player.currentTime = 0;
    player.volume = 0;
    player.muted = ambienceMutedRef.current;
    player.load();

    void player.play().then(() => {
      setAmbienceActive(true);
      const startedAt = performance.now();
      const fadeIn = (now: number) => {
        const currentPlayer = mirrorAudio.current;
        if (!currentPlayer || currentPlayer.paused) {
          mirrorFadeFrame.current = null;
          return;
        }
        const progress = Math.min((now - startedAt) / MIRROR_FADE_IN_MS, 1);
        currentPlayer.volume = MIRROR_VOLUME * progress;
        if (progress < 1) mirrorFadeFrame.current = requestAnimationFrame(fadeIn);
        else mirrorFadeFrame.current = null;
      };
      mirrorFadeFrame.current = requestAnimationFrame(fadeIn);
    }).catch(() => setAmbienceActive(false));
  }, []);

  const stopMirrorAmbience = useCallback(() => {
    if (mirrorFadeFrame.current !== null) cancelAnimationFrame(mirrorFadeFrame.current);
    mirrorFadeFrame.current = null;
    const player = mirrorAudio.current;
    if (player) {
      player.pause();
      player.currentTime = 0;
    }
    setAmbienceActive(false);
  }, []);

  useEffect(() => {
    const player = audio.current;
    if (player) {
      player.volume = DEFAULT_VOLUME;
      player.muted = mutedRef.current;
    }

    const startOnFirstClick = (event: MouseEvent) => {
      window.removeEventListener("click", startOnFirstClick, true);
      const target = event.target;
      ignorePlayClickRef.current = target instanceof Element && Boolean(target.closest(".music-play-toggle"));
      void startPlayback();
    };
    let suppressVoiceGuideForWelcomeClick = false;
    const suppressVoiceGuideForWelcome = () => {
      suppressVoiceGuideForWelcomeClick = true;
      window.setTimeout(() => {
        suppressVoiceGuideForWelcomeClick = false;
      }, 0);
    };
    const speakRequestedText = (event: Event) => {
      const detail = (event as CustomEvent<{ text?: string; productSlug?: string }>).detail;
      if (!suppressVoiceGuideForWelcomeClick && detail?.text) speak(detail.text, detail.productSlug);
    };

    // The first site click starts background music; welcome playback is coordinated by the app-level player.
    window.addEventListener("click", startOnFirstClick, { once: true, capture: true });
    window.addEventListener(VOICE_GUIDE_EVENT, speakRequestedText);
    window.addEventListener(WELCOME_AUDIO_STARTED_EVENT, suppressVoiceGuideForWelcome);
    window.addEventListener(MIRROR_MOOD_AUDIO_EVENT, playMirrorAmbience);
    window.addEventListener(STOP_MIRROR_AUDIO_EVENT, stopMirrorAmbience);

    return () => {
      window.removeEventListener("click", startOnFirstClick, true);
      window.removeEventListener(VOICE_GUIDE_EVENT, speakRequestedText);
      window.removeEventListener(WELCOME_AUDIO_STARTED_EVENT, suppressVoiceGuideForWelcome);
      window.removeEventListener(MIRROR_MOOD_AUDIO_EVENT, playMirrorAmbience);
      window.removeEventListener(STOP_MIRROR_AUDIO_EVENT, stopMirrorAmbience);
      if (fadeFrame.current !== null) cancelAnimationFrame(fadeFrame.current);
      if (mirrorFadeFrame.current !== null) cancelAnimationFrame(mirrorFadeFrame.current);
      mirrorAudio.current?.pause();
    };
  }, [language, playMirrorAmbience, speak, startPlayback, stopMirrorAmbience]);

  async function togglePlayback() {
    const player = audio.current;
    if (!player) return;
    if (ignorePlayClickRef.current) {
      ignorePlayClickRef.current = false;
      return;
    }
    if (!player.paused) {
      player.pause();
      startingRef.current = false;
      if (fadeFrame.current !== null) cancelAnimationFrame(fadeFrame.current);
      fadeFrame.current = null;
      fadeProgress.current = 1;
      setPlaying(false);
      return;
    }
    await startPlayback();
  }

  function changeVolume(event: React.ChangeEvent<HTMLInputElement>) {
    const nextVolume = Math.max(0, Math.min(1, Number(event.currentTarget.value) / 100));
    volumeRef.current = nextVolume;
    setVolume(nextVolume);
    if (audio.current) {
      const currentFadeProgress = fadeFrame.current !== null && !audio.current.paused ? fadeProgress.current : 1;
      audio.current.volume = nextVolume * currentFadeProgress;
    }
  }

  function toggleMusicMute() {
    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;
    setMuted(nextMuted);
    if (audio.current) audio.current.muted = nextMuted;
  }

  function toggleVoiceMute() {
    const nextMuted = !voiceMutedRef.current;
    voiceMutedRef.current = nextMuted;
    setVoiceMuted(nextMuted);
    setGlobalVoiceMuted(nextMuted);
  }

  function toggleAmbienceMute() {
    const nextMuted = !ambienceMutedRef.current;
    ambienceMutedRef.current = nextMuted;
    setAmbienceMuted(nextMuted);
    if (mirrorAudio.current) mirrorAudio.current.muted = nextMuted;
  }

  return (
    <div className="music-control" role="group" aria-label="Sound controls">
      <audio ref={mirrorAudio} loop preload="none" />
      <button
        className="music-control-button music-play-toggle"
        type="button"
        onClick={togglePlayback}
        aria-label={playing ? "Pause background music" : "Play background music"}
        aria-pressed={playing}
        title={playing ? "Pause music" : "Play music"}
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <span className="music-control-label"><Music2 size={12} /> Ambient</span>
      <input
        className="music-volume-slider"
        type="range"
        min="0"
        max="100"
        step="1"
        value={Math.round(volume * 100)}
        onChange={changeVolume}
        aria-label="Background music volume"
        aria-valuetext={`${Math.round(volume * 100)} percent`}
      />
      <button
        className="music-control-button music-mute-toggle"
        type="button"
        onClick={toggleMusicMute}
        aria-label={muted ? "Unmute background music" : "Mute background music"}
        aria-pressed={muted}
        title={muted ? "Unmute music" : "Mute music"}
      >
        {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>
      <button
        className="music-control-button music-voice-toggle"
        type="button"
        onClick={toggleVoiceMute}
        aria-label={voiceMuted ? "Unmute voice guide" : "Mute voice guide"}
        aria-pressed={voiceMuted}
        title={voiceMuted ? "Unmute voice guide" : "Mute voice guide"}
      >
        {voiceMuted ? <MicOff size={15} /> : <Mic size={15} />}
      </button>
      <button
        className={`music-control-button music-ambience-toggle${ambienceActive ? " is-active" : ""}`}
        type="button"
        onClick={toggleAmbienceMute}
        aria-label={ambienceMuted ? "Unmute Mirror ambience" : "Mute Mirror ambience"}
        aria-pressed={ambienceMuted}
        title={ambienceMuted ? "Unmute Mirror ambience" : "Mute Mirror ambience"}
      >
        {ambienceMuted ? <VolumeX size={15} /> : <Waves size={15} />}
      </button>
    </div>
  );
}
