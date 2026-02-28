import { problemSolution } from "@/data/content";
import { WalletIcon, HomeIcon, ArrowPathIcon } from "./Icons";

const iconMap = {
  wallet: WalletIcon,
  home: HomeIcon,
  arrowPath: ArrowPathIcon,
} as const;

export default function ProblemSolution() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Masalah Umum
        </p>
        <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {problemSolution.sectionTitle}
        </h2>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-3">
          {problemSolution.problems.map((problem) => {
            const Icon = iconMap[problem.icon];
            return (
              <div key={problem.title} className="bg-white p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {problem.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl bg-foreground p-10 text-center">
          <h3 className="text-xl font-bold text-white">
            {problemSolution.solution.title}
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-400">
            {problemSolution.solution.description}
          </p>
        </div>
      </div>
    </section>
  );
}
