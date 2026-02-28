"use client";

import { useState } from "react";
import { faq } from "@/data/content";
import { ChevronDownIcon } from "./Icons";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="border-t border-gray-100 bg-secondary px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted">
          FAQ
        </p>
        <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {faq.sectionTitle}
        </h2>

        <div className="mt-14 space-y-2">
          {faq.items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-sm font-semibold text-foreground pr-4">
                  {item.question}
                </span>
                <ChevronDownIcon
                  className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-5 text-sm leading-relaxed text-muted">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
