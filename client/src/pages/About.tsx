import { Link } from "wouter";
import { SiteLayout } from "@/components/Storefront";
import AboutNarration from "@/components/AboutNarration";
import TypewriterText from "@/components/TypewriterText";
import "./About.css";

export default function About() {
  return (
    <SiteLayout>
      <main className="section-shell">
        <div className="page-heading">
          <span className="kicker">Our point of view</span>
          <h1>The Nuit Lumière Museum</h1>
        </div>
        <article className="content-copy about-copy">
          <AboutNarration />
          <p>
            <TypewriterText
              text="Nuit Lumière is not just a perfume store. It is a digital museum created for a loved one. A space where the world's finest fragrances meet art, memories, and emotions."
              intervalMs={100}
            />
          </p>
          <p>
            <TypewriterText
              text="Dedicated to the memory of my mother, whose beauty and grace inspired this project. Every bottle tells a story, and every scent is a memory."
              intervalMs={100}
            />
          </p>
          <p>
            <TypewriterText
              text="Step inside, breathe deeply, and find the fragrance that speaks to your soul."
              intervalMs={100}
            />
          </p>
          <Link className="button button-gold" href="/collection">
            Explore the collection
          </Link>
        </article>
      </main>
    </SiteLayout>
  );
}
