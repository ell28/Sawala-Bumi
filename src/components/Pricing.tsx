import { pricing } from "@/data/content";
import { CheckIcon } from "./Icons";

export default function Pricing() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Harga Transparan
        </p>
        <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {pricing.sectionTitle}
        </h2>

        <div className="mx-auto mt-14 max-w-sm rounded-2xl border border-gray-200 bg-white p-10">
          <div className="text-center">
            <div className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              {pricing.price}
            </div>
            <div className="mt-2 text-sm text-muted">
              per sesi / {pricing.duration}
            </div>
          </div>

          <div className="my-8 h-px bg-gray-100" />

          <ul className="space-y-4">
            {pricing.inclusions.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                <span className="text-sm text-foreground">{item}</span>
              </li>
            ))}
          </ul>

          <a
            href="#booking"
            className="mt-10 block w-full rounded-full bg-foreground py-4 text-center text-sm font-medium tracking-wide text-white transition-all hover:bg-primary-light hover:shadow-lg"
          >
            {pricing.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
