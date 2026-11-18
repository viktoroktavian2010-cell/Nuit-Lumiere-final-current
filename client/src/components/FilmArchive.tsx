import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent } from "react";
import { Link } from "wouter";
import { motion, useAnimationFrame, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import type { CatalogProduct } from "@shared/catalog";

const releaseYears: Record<string, string> = {
  angel: "1992",
  aventus: "2010",
  "baccarat-rouge-540": "2014",
  "black-opium": "2014",
  "black-orchid": "2006",
  "black-orchid-parfum": "2020",
  "bleu-de-chanel": "2010",
  "chanel-no5": "1921",
  daisy: "2007",
  fabulous: "2017",
  flowerbomb: "2005",
  "for-her": "2003",
  "good-girl": "2016",
  "hypnotic-poison": "1998",
  jadore: "1999",
  "la-vie-est-belle": "2012",
  "le-male": "1995",
  libre: "2019",
  "lost-cherry": "2018",
  opium: "1977",
  sauvage: "2015",
  shalimar: "1925",
  "terre-dhermes": "2006",
};

type DatedProduct = CatalogProduct & { createdAt?: Date | string };
function creationYear(product: CatalogProduct) {
  const knownYear = releaseYears[product.slug];
  if (knownYear) return knownYear;
  const createdAt = (product as DatedProduct).createdAt;
  if (createdAt) {
    const year = new Date(createdAt).getFullYear();
    if (Number.isFinite(year)) return String(year);
  }
  return "— — — —";
}

function modulo(value: number, modulus: number) {
  if (modulus <= 0) return 0;
  return ((value % modulus) + modulus) % modulus;
}

export default function FilmArchive({ products }: { products: CatalogProduct[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);
  const previousScrollY = useRef(0);
  const dragRef = useRef<{ pointerId: number; startX: number; startOffset: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const [loopWidth, setLoopWidth] = useState(0);

  const { scrollY } = useScroll();
  const autoOffset = useMotionValue(0);
  const manualOffset = useMotionValue(0);
  const direction = useMotionValue(1);
  const scrollOffset = useTransform(scrollY, (latest) => latest * 0.75);
  const x = useTransform([autoOffset, scrollOffset, manualOffset], (latest) => {
    const [auto, page, manual] = latest as [number, number, number];
    if (!loopWidth) return 0;
    return -modulo(auto + page + manual, loopWidth);
  });

  useEffect(() => {
    const firstSet = firstSetRef.current;
    if (!firstSet) return;
    const updateWidth = () => setLoopWidth(firstSet.getBoundingClientRect().width);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(firstSet);
    window.addEventListener("resize", updateWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [products.length]);

  useEffect(() => {
    previousScrollY.current = scrollY.get();
  }, [scrollY]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const difference = latest - previousScrollY.current;
    if (Math.abs(difference) > 0.5) direction.set(difference > 0 ? 1 : -1);
    previousScrollY.current = latest;
  });

  useAnimationFrame((_time, delta) => {
    if (loopWidth > 0) {
      const movement = direction.get() * 38 * (delta / 1000);
      autoOffset.set(modulo(autoOffset.get() + movement, loopWidth));
    }
  });

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startOffset: manualOffset.get(), moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !loopWidth) return;
    if (Math.abs(event.clientX - drag.startX) > 8) drag.moved = true;
    const distance = drag.startOffset - (event.clientX - drag.startX);
    manualOffset.set(modulo(distance, loopWidth));
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      if (dragRef.current.moved) {
        suppressClickRef.current = true;
        window.setTimeout(() => { suppressClickRef.current = false; }, 0);
      }
      dragRef.current = null;
    }
  }

  function suppressDraggedClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  }

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && loopWidth) {
      event.preventDefault();
      manualOffset.set(modulo(manualOffset.get() + (event.key === "ArrowRight" ? 190 : -190), loopWidth));
    }
  }

  function renderFrames(isClone: boolean) {
    return products.map((product, index) => {
      const target = product.gender === "men" ? `/gallery#for-him-${product.slug}` : `/gallery#${product.slug}`;
      const year = creationYear(product);
      return (
        <article className="film-archive-frame" key={`${isClone ? "clone" : "main"}-${product.slug}`}>
          <Link
            className="film-frame-link"
            href={target}
            tabIndex={isClone ? -1 : undefined}
            aria-label={`${product.brand} ${product.name}, ${year}`}
          >
            <div className="film-frame-image"><img src={product.image} alt={`${product.name} perfume bottle`} loading={index < 4 ? "eager" : "lazy"} /></div>
            <div className="film-frame-copy">
              <span className="film-frame-brand">{product.brand}</span>
              <h3>{product.name}</h3>
              <span className="film-frame-year" data-year={year}>{year}</span>
            </div>
          </Link>
        </article>
      );
    });
  }

  return (
    <section className="section-shell film-archive-section" aria-labelledby="film-archive-title">
      <div className="section-heading">
        <div><span className="kicker">Frames from the collection</span><h2 id="film-archive-title">The Film Archive</h2></div>
      </div>
      <div
        className="film-archive-window"
        ref={viewportRef}
        role="region"
        aria-label="Film Archive fragrance frames; drag or use arrow keys to browse"
        tabIndex={0}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={suppressDraggedClick}
        onKeyDown={handleKeys}
      >
        <motion.div className="film-archive-track" style={{ x, rotateX: 1.25, transformStyle: "preserve-3d" }}>
          <div className="film-archive-set" ref={firstSetRef}>{renderFrames(false)}</div>
          <div className="film-archive-set" aria-hidden="true">{renderFrames(true)}</div>
        </motion.div>
      </div>
    </section>
  );
}
