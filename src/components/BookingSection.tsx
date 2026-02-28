"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import SlotPicker from "./SlotPicker";
import BookingForm from "./BookingForm";
import { BookingSlot } from "@/lib/types";

function BookingSectionInner() {
  const searchParams = useSearchParams();
  const utmSource = searchParams.get("utm_source") || "";
  const utmCampaign = searchParams.get("utm_campaign") || "";

  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);

  return (
    <section id="booking" className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Reservasi
        </p>
        <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Booking Konsultasi
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted">
          Pilih jadwal yang sesuai dan isi data Anda untuk memulai proses
          reservasi.
        </p>

        {/* Step indicator */}
        <div className="mx-auto mt-10 flex max-w-xs items-center justify-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-white">
              1
            </span>
            <span className="font-medium text-foreground">Pilih Jadwal</span>
          </div>
          <div className="h-px w-8 bg-gray-300" />
          <div className="flex items-center gap-1.5">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                selectedSlot
                  ? "bg-foreground text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              2
            </span>
            <span
              className={`font-medium ${
                selectedSlot ? "text-foreground" : "text-gray-400"
              }`}
            >
              Isi Data
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
            <SlotPicker
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
            <BookingForm selectedSlot={selectedSlot} utmSource={utmSource} utmCampaign={utmCampaign} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BookingSection() {
  return (
    <Suspense>
      <BookingSectionInner />
    </Suspense>
  );
}
