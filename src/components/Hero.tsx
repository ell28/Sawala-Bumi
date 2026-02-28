import { hero } from "@/data/content";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,0,0,0.02)_0%,transparent_70%)]" />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Konsultasi Arsitek Profesional
        </p>
        <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl whitespace-pre-line">
          {hero.headline}
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
          {hero.subheadline}
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#booking"
            className="inline-block rounded-full bg-foreground px-10 py-4 text-sm font-medium tracking-wide text-white transition-all hover:bg-primary-light hover:shadow-xl"
          >
            {hero.cta}
          </a>
          <a
            href="#how-it-works"
            className="inline-block text-sm font-medium text-muted underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Lihat cara kerjanya
          </a>
        </div>
      </div>
    </section>
  );
}
