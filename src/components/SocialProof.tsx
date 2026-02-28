import { socialProof } from "@/data/content";
import { QuoteIcon } from "./Icons";

export default function SocialProof() {
  return (
    <section className="border-y border-gray-100 bg-secondary px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Testimoni
        </p>
        <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {socialProof.sectionTitle}
        </h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {socialProof.testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-gray-200 bg-white p-7"
            >
              <QuoteIcon className="h-6 w-6 text-gray-200" />
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {t.quote}
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-white">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {t.name}
                  </div>
                  <div className="text-xs text-muted">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
