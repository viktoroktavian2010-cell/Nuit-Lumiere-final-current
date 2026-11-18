import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/Storefront";
import TypewriterText from "@/components/TypewriterText";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

export default function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dustTransitionRef = useRef<HTMLDivElement>(null);
  const [dustRevealed, setDustRevealed] = useState(false);
  const dustResetTimerRef = useRef<number | null>(null);

  const createDustParticles = (count: number, seedOffset = 0) =>
    Array.from({ length: count }, (_, index) => {
      const seed = index + seedOffset + 1;
      const angle = (seed * 137.507 * Math.PI) / 180;
      const radiusX = 34 + ((seed * 29) % 122);
      const radiusY = 65 + ((seed * 31) % 185);
      const burstX = Math.round(Math.cos(angle) * radiusX);
      const burstY = Math.round(Math.sin(angle) * radiusY);
      const settleX = Math.round(burstX * 0.78 + ((seed * 17) % 25) - 12);
      const settleY = Math.max(
        8,
        Math.round(burstY * 0.36 + 82 + ((seed * 23) % 104)),
      );
      return {
        key: seed,
        style: {
          left: `${(seed * 47) % 100}%`,
          "--burst-x": `${burstX}px`,
          "--burst-y": `${burstY}px`,
          "--settle-x": `${settleX}px`,
          "--settle-y": `${settleY}px`,
          "--fade-y": `${settleY + 70 + ((seed * 7) % 54)}px`,
          "--particle-delay": `${(seed * 13) % 400}ms`,
          "--particle-size": `${1.3 + ((seed * 11) % 29) / 10}px`,
          "--spark-opacity": `${0.64 + ((seed * 19) % 35) / 100}`,
        } as CSSProperties,
      };
    });

  const transitionDustParticles = createDustParticles(120);
  const mediaDustParticles = createDustParticles(24, 120);

  useEffect(() => {
    const transition = dustTransitionRef.current;
    if (!transition) return;

    const revealOnScroll = () => {
      if (window.scrollY <= 0) return;
      const { top, bottom } = transition.getBoundingClientRect();
      if (top < window.innerHeight * 0.96 && bottom > 0) {
        setDustRevealed(true);
        dustResetTimerRef.current = window.setTimeout(() => {
          setDustRevealed(false);
          dustResetTimerRef.current = null;
        }, 5400);
        window.removeEventListener("scroll", revealOnScroll);
      }
    };

    window.addEventListener("scroll", revealOnScroll, { passive: true });
    revealOnScroll();
    return () => {
      window.removeEventListener("scroll", revealOnScroll);
      if (dustResetTimerRef.current !== null) {
        window.clearTimeout(dustResetTimerRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    const title = titleRef.current;
    const upperModel = document.querySelector<HTMLElement>(".hero");
    const duo = document.querySelector<HTMLElement>(".fragrance-duo");
    if (!title || !upperModel || !duo) return;

    let frame = 0;
    const updatePosition = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        title.style.setProperty("--fragrance-title-center-offset", "0px");
        const upperModelBottom = upperModel.getBoundingClientRect().bottom + window.scrollY;
        const duoTop = duo.getBoundingClientRect().top + window.scrollY;
        const titleRect = title.getBoundingClientRect();
        const titleCenter = titleRect.top + window.scrollY + titleRect.height / 2;
        const targetCenter = (upperModelBottom + duoTop) / 2;
        title.style.setProperty(
          "--fragrance-title-center-offset",
          `${targetCenter - titleCenter}px`,
        );
      });
    };

    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(upperModel);
    observer.observe(title);
    observer.observe(duo);
    window.addEventListener("resize", updatePosition, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.cancelAnimationFrame(frame);
      title.style.removeProperty("--fragrance-title-center-offset");
    };
  }, []);

  return (
    <SiteLayout>
      <main>
        <section className="hero">
          <div className="hero-image">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/media/nuit-lumiere-poster.jpg"
              aria-label="Woman in evening light for Nuit Lumière"
            >
              <source src="/media/nuit-lumiere-hero.mp4" type="video/mp4" />
            </video>
            <div
              className="gold-dust-media-layer gold-dust-media-layer--hero"
              data-visible={dustRevealed}
              aria-hidden="true"
            >
              {mediaDustParticles.map(({ key, style }) => (
                <span
                  key={key}
                  className="gold-dust-media-layer__particle"
                  style={style}
                />
              ))}
            </div>
          </div>
          <div className="hero-copy">
            <span className="eyebrow">The Collection</span>
            <h1>
              Nuit
              <br />
              <span>Lumière</span>
            </h1>
            <p>
              Discover a world of fragrance, composed for the quiet beauty of
              evening.
            </p>
            <div className="hero-actions">
              <Link className="button button-gold" href="/collection">
                Explore the collection <ArrowRight size={14} />
              </Link>
              <Link className="button button-outline" href="/about">
                About Nuit Lumière
              </Link>
            </div>
            <div className="hero-rule" />
          </div>
        </section>
        <div
          ref={dustTransitionRef}
          className="gold-dust-transition"
          data-visible={dustRevealed}
          aria-hidden="true"
        >
          {transitionDustParticles.map(({ key, style }) => (
            <span
              key={key}
              className="gold-dust-transition__particle"
              style={style}
            />
          ))}
        </div>
        <section className="fragrance-duo-intro">
          <h2 ref={titleRef} className="fragrance-duo-intro__title">
            <TypewriterText
              text="Elegance Meets Desire"
              intervalMs={100}
              revealMode="handwriting"
              className="for-him-typewriter"
              disintegrate
            />
          </h2>
        </section>
        <section
          className="fragrance-duo"
          aria-label="Explore perfumes and colognes"
        >
          <article
            className="fragrance-duo__panel fragrance-duo__panel--her"
            data-dust-active={dustRevealed}
            aria-labelledby="fragrance-for-her-title"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/media/for-her-poster.jpg"
              aria-hidden="true"
            >
              <source src="/media/for-her-video.mp4" type="video/mp4" />
            </video>
            <div
              className="gold-dust-media-layer gold-dust-media-layer--card"
              data-visible={dustRevealed}
              aria-hidden="true"
            >
              {mediaDustParticles.map(({ key, style }) => (
                <span
                  key={key}
                  className="gold-dust-media-layer__particle"
                  style={style}
                />
              ))}
            </div>
            <div className="fragrance-duo__copy">
              <span className="fragrance-duo__eyebrow">The feminine edit</span>
              <h2 id="fragrance-for-her-title">Perfumes</h2>
              <p>
                A luminous ritual. Fragrances that linger like a secret after
                dusk.
              </p>
              <Link className="fragrance-duo__button" href="/gallery?gender=women">
                <span className="fragrance-duo__button-label">Discover Perfumes</span>
                <ArrowRight size={14} aria-hidden="true" />
                <span className="fragrance-duo__button-particles" aria-hidden="true">
                  {Array.from({ length: 12 }, (_, index) => (
                    <span key={index} className="fragrance-duo__button-particle" />
                  ))}
                </span>
              </Link>
              <span className="fragrance-duo__caption">
                For the woman he craves
              </span>
            </div>
          </article>
          <article
            id="for-him-products"
            className="fragrance-duo__panel fragrance-duo__panel--him"
            data-dust-active={dustRevealed}
            aria-labelledby="fragrance-for-him-title"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/media/for-him-portrait.jpg"
              aria-hidden="true"
            >
              <source src="/media/for-him-video.mp4" type="video/mp4" />
            </video>
            <div
              className="gold-dust-media-layer gold-dust-media-layer--card"
              data-visible={dustRevealed}
              aria-hidden="true"
            >
              {mediaDustParticles.map(({ key, style }) => (
                <span
                  key={key}
                  className="gold-dust-media-layer__particle"
                  style={style}
                />
              ))}
            </div>
            <div className="fragrance-duo__copy">
              <span className="fragrance-duo__eyebrow">The masculine edit</span>
              <h2 id="fragrance-for-him-title">Colognes</h2>
              <p>
                A magnetic signature. Modern compositions with a quietly
                commanding presence.
              </p>
              <Link
                className="fragrance-duo__button"
                href="/gallery?gender=men"
              >
                <span className="fragrance-duo__button-label">Explore Colognes</span>
                <ArrowRight size={14} aria-hidden="true" />
                <span className="fragrance-duo__button-particles" aria-hidden="true">
                  {Array.from({ length: 12 }, (_, index) => (
                    <span key={index} className="fragrance-duo__button-particle" />
                  ))}
                </span>
              </Link>
              <span className="fragrance-duo__caption">
                For the man you desire
              </span>
            </div>
          </article>
        </section>
      </main>
    </SiteLayout>
  );
}
