import { useEffect, useRef, useState } from "react";
import { CloudRain, Moon, Sun } from "lucide-react";
import type { CatalogProduct } from "@shared/catalog";
import { seedCatalogProducts } from "@shared/catalog";
import { SiteLayout } from "@/components/Storefront";
import TypewriterText from "@/components/TypewriterText";
import { trpc } from "@/lib/trpc";
import { requestMirrorMoodAudio, stopMirrorMoodAudio } from "@/lib/audioEvents";
import {
  cancelQueuedVoicesWithPrefix,
  cancelVoice,
  queueAudioVoice,
} from "@/lib/voicePlayback";
import "./Mirror.css";

const moods = [
  {
    id: "sun",
    title: "Warmth of the Sun",
    translation: "Тепло солнца",
    productSlug: "jadore",
    poem: "For the moments when you need to feel the warmth return.",
    Icon: Sun,
  },
  {
    id: "rain",
    title: "Freshness of Rain",
    translation: "Свежесть дождя",
    productSlug: "sauvage",
    poem: "For the quiet clarity that arrives after the rain.",
    Icon: CloudRain,
  },
  {
    id: "night",
    title: "Velvet of the Night",
    translation: "Бархат ночи",
    productSlug: "black-orchid",
    poem: "For the hours when the world softens into velvet.",
    Icon: Moon,
  },
] as const;

type MoodId = (typeof moods)[number]["id"];

export default function Mirror() {
  const query = trpc.catalog.list.useQuery(undefined, { staleTime: 60_000 });
  const products = query.data?.length ? query.data : seedCatalogProducts;
  const [selectedMoodId, setSelectedMoodId] = useState<MoodId | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const sunNarrationRef = useRef<HTMLAudioElement | null>(null);
  const rainNarrationRef = useRef<HTMLAudioElement | null>(null);
  const nightNarrationRef = useRef<HTMLAudioElement | null>(null);
  const failedNarrationRef = useRef<MoodId | null>(null);
  const narrationRefs = {
    sun: sunNarrationRef,
    rain: rainNarrationRef,
    night: nightNarrationRef,
  };
  const selectedMood = moods.find(mood => mood.id === selectedMoodId);
  const selectedProduct: CatalogProduct | undefined = selectedMood
    ? (products.find(product => product.slug === selectedMood.productSlug) ??
      seedCatalogProducts.find(
        product => product.slug === selectedMood.productSlug
      ) ??
      products[0])
    : undefined;

  useEffect(
    () => () => {
      stopMirrorMoodAudio();
      cancelQueuedVoicesWithPrefix("mirror:");
      cancelVoice("mirror:sun");
      cancelVoice("mirror:rain");
      cancelVoice("mirror:night");
      if (scrollTimerRef.current !== null)
        window.clearTimeout(scrollTimerRef.current);
    },
    []
  );

  useEffect(() => {
    if (!selectedMoodId) return;
    if (scrollTimerRef.current !== null)
      window.clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = window.setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
    return () => {
      if (scrollTimerRef.current !== null)
        window.clearTimeout(scrollTimerRef.current);
    };
  }, [selectedMoodId]);

  return (
    <SiteLayout>
      <main className="mirror-page">
        <div className="mirror-backdrops" aria-hidden="true">
          {moods.map(mood => (
            <div
              key={mood.id}
              className={`mirror-backdrop mirror-backdrop-${mood.id}${selectedMoodId === mood.id ? " is-active" : ""}`}
            />
          ))}
        </div>

        <div className="mirror-content">
          <header className="mirror-intro">
            <span className="kicker">Olfactory Mirror</span>
            <h1>The Scent of Memories</h1>
            <p>Choose the feeling you would like to return to.</p>
          </header>

          <section className="mirror-mood-grid" aria-label="Choose a mood">
            {moods.map(({ id, title, translation, Icon }) => (
              <button
                key={id}
                type="button"
                className={`mirror-mood-card${selectedMoodId === id ? " is-selected" : ""}`}
                onClick={() => {
                  setSelectedMoodId(id);
                  requestMirrorMoodAudio(id);
                  if (selectedMoodId !== id || failedNarrationRef.current === id) {
                    cancelQueuedVoicesWithPrefix("mirror:");
                    const narration = narrationRefs[id].current;
                    if (narration) {
                      failedNarrationRef.current = null;
                      queueAudioVoice(`mirror:${id}`, narration, {
                        restart: true,
                        volume: 0.25,
                        playbackRate: id === "sun" ? 0.73 : id === "rain" ? 0.94 : 0.97,
                        onBlocked: () => {
                          failedNarrationRef.current = id;
                        },
                      });
                    }
                  }
                }}
                aria-pressed={selectedMoodId === id}
              >
                <Icon
                  className="mirror-mood-icon"
                  size={30}
                  strokeWidth={1.2}
                  aria-hidden="true"
                />
                <span className="mirror-mood-title">{title}</span>
                <span className="mirror-mood-translation" lang="ru">
                  {translation}
                </span>
                <span className="mirror-mood-mark" aria-hidden="true" />
              </button>
            ))}
          </section>

          <div hidden aria-hidden="true">
            <audio
              ref={sunNarrationRef}
              src="/media/mirror-sun-voice.mp3"
              preload="auto"
            />
            <audio
              ref={rainNarrationRef}
              src="/media/mirror-rain-voice.mp3"
              preload="auto"
            />
            <audio
              ref={nightNarrationRef}
              src="/media/mirror-night-voice.mp3"
              preload="auto"
            />
          </div>

          {selectedMood && selectedProduct && (
            <section
              ref={resultRef}
              className="mirror-result"
              key={selectedMood.id}
              aria-live="polite"
              aria-label={`${selectedMood.title} fragrance`}
            >
              <div className="mirror-bottle-frame">
                <img
                  className="mirror-bottle"
                  src={selectedProduct.image}
                  alt={`${selectedProduct.name} perfume bottle`}
                  loading="eager"
                />
              </div>
              <span className="mirror-scent-name">
                {selectedProduct.brand} · {selectedProduct.name}
              </span>
              <p className="mirror-poem">
                <TypewriterText text={selectedMood.poem} intervalMs={100} />
              </p>
            </section>
          )}
        </div>
      </main>
    </SiteLayout>
  );
}
