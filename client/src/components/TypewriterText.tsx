import { useEffect, useState, type CSSProperties } from "react";

type TypewriterTextProps = {
  text: string;
  intervalMs?: number;
  className?: string;
  revealMode?: "typewriter" | "handwriting";
  disintegrate?: boolean;
};

/** Reveals text one Unicode character at a time using JavaScript state. */
export default function TypewriterText({
  text,
  intervalMs = 100,
  className,
  revealMode = "typewriter",
  disintegrate = false,
}: TypewriterTextProps) {
  const [visibleText, setVisibleText] = useState("");
  const pollenParticles = disintegrate
    ? Array.from({ length: 36 }, (_, index) => {
        const seed = index + 1;
        return {
          key: seed,
          style: {
            left: `${(seed * 47) % 100}%`,
            top: `${18 + ((seed * 31) % 64)}%`,
            "--pollen-wind-x": `${85 + ((seed * 29) % 70)}vw`,
            "--pollen-wind-y": `-${50 + ((seed * 37) % 150)}px`,
            "--pollen-delay": `${(seed * 17) % 180}ms`,
            "--pollen-size": `${1.3 + ((seed * 11) % 18) / 10}px`,
            "--pollen-opacity": `${0.52 + ((seed * 7) % 43) / 100}`,
          } as CSSProperties,
        };
      })
    : [];

  useEffect(() => {
    if (revealMode === "handwriting") {
      setVisibleText("");
      return;
    }

    const characters = Array.from(text);
    let visibleCount = 0;
    setVisibleText("");

    if (characters.length === 0) return;

    const timer = window.setInterval(() => {
      visibleCount += 1;
      setVisibleText(characters.slice(0, visibleCount).join(""));
      if (visibleCount >= characters.length) window.clearInterval(timer);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [text, intervalMs, revealMode]);

  return (
    <span
      className={className}
      aria-label={text}
      data-disintegrate={disintegrate ? "true" : undefined}
    >
      {revealMode === "handwriting" ? (
        <>
          <span
            className="handwriting-reveal"
            style={{ "--text-reveal-duration": `${Array.from(text).length * intervalMs}ms` } as CSSProperties}
            aria-hidden="true"
          >
            {text}
          </span>
          {disintegrate && (
            <span className="fragrance-title-pollen" aria-hidden="true">
              {pollenParticles.map(({ key, style }) => (
                <span
                  key={key}
                  className="fragrance-title-pollen__particle"
                  style={style}
                />
              ))}
            </span>
          )}
        </>
      ) : visibleText}
    </span>
  );
}
