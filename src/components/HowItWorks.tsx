import { howItWorks } from "@/data/content";
import { CalendarIcon, CreditCardIcon, ChatIcon } from "./Icons";

const iconMap = {
  calendar: CalendarIcon,
  creditCard: CreditCardIcon,
  chat: ChatIcon,
} as const;

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-gray-100 bg-secondary px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Proses Sederhana
        </p>
        <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {howItWorks.sectionTitle}
        </h2>

        <div className="mt-14 grid gap-12 sm:grid-cols-3 sm:gap-8">
          {howItWorks.steps.map((step) => {
            const Icon = iconMap[step.icon];
            return (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white">
                  <Icon className="h-6 w-6 text-foreground" />
                </div>
                <div className="mt-5 inline-block rounded-full bg-foreground px-3 py-0.5 text-[11px] font-semibold tracking-wider text-white uppercase">
                  Langkah {step.number}
                </div>
                <h3 className="mt-3 text-lg font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
