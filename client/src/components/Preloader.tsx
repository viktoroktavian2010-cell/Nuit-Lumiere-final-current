type PreloaderProps = { leaving: boolean };

export default function Preloader({ leaving }: PreloaderProps) {
  return (
    <div className={`vintage-preloader${leaving ? " is-leaving" : ""}`} role="status" aria-label="Loading Nuit Lumière">
      <div className="film-strip-field" aria-hidden="true">
        <span className="film-strip film-strip-one" />
        <span className="film-strip film-strip-two" />
        <span className="film-strip film-strip-three" />
        <span className="film-strip film-strip-four" />
        <span className="film-strip film-strip-five" />
      </div>
      <div className="preloader-vignette" aria-hidden="true" />
      <div className="preloader-grain" aria-hidden="true" />
      <div className="preloader-wordmark" aria-label="Nuit Lumière">
        <span>NUIT LUMIÈRE</span>
        <i aria-hidden="true" />
      </div>
    </div>
  );
}
