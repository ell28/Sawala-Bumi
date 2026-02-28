"use client";

import { useEffect, useMemo, useState } from "react";
import { generateAvailableSlots, groupSlotsByDate } from "@/lib/slots";
import { BookingSlot } from "@/lib/types";
import { CalendarIcon, ClockIcon } from "./Icons";

interface SlotPickerProps {
  onSelectSlot: (slot: BookingSlot | null) => void;
  selectedSlot: BookingSlot | null;
}

export default function SlotPicker({
  onSelectSlot,
  selectedSlot,
}: SlotPickerProps) {
  const allSlots = useMemo(() => generateAvailableSlots(), []);
  const [bookedDatetimes, setBookedDatetimes] = useState<Set<string>>(
    new Set()
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch booked slots on mount
  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (data.bookedSlots) {
          setBookedDatetimes(new Set(data.bookedSlots));
        }
      })
      .catch(() => {});
  }, []);

  // Filter out booked slots
  const availableSlots = useMemo(
    () => allSlots.filter((s) => !bookedDatetimes.has(s.datetime)),
    [allSlots, bookedDatetimes]
  );

  const grouped = useMemo(() => groupSlotsByDate(availableSlots), [availableSlots]);
  const dates = useMemo(() => Array.from(grouped.keys()), [grouped]);

  const timeSlotsForDate = selectedDate
    ? grouped.get(selectedDate) || []
    : [];

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    onSelectSlot(null);
  };

  const handleTimeClick = (slot: BookingSlot) => {
    onSelectSlot(slot);
  };

  return (
    <div className="space-y-8">
      {/* Date picker */}
      <div>
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="h-4 w-4 text-muted" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Pilih Tanggal
          </h3>
        </div>

        {dates.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Tidak ada jadwal tersedia saat ini.
          </p>
        ) : (
          <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1">
            {dates.map((date) => {
              const sample = grouped.get(date)![0];
              const isSelected = selectedDate === date;
              const parts = sample.label.split(", ");
              const dayName = parts[0];
              const dateParts = parts[1]?.split(" ") || [];
              const dateNum = dateParts[0];
              const monthName = dateParts[1];

              return (
                <button
                  key={date}
                  onClick={() => handleDateClick(date)}
                  className={`flex shrink-0 flex-col items-center rounded-xl border px-5 py-3.5 transition-all ${
                    isSelected
                      ? "border-foreground bg-foreground text-white"
                      : "border-gray-200 bg-white text-foreground hover:border-gray-400"
                  }`}
                >
                  <span
                    className={`text-[11px] font-medium uppercase tracking-wider ${
                      isSelected ? "text-gray-400" : "text-muted"
                    }`}
                  >
                    {dayName}
                  </span>
                  <span className="mt-1 text-xl font-bold leading-none">
                    {dateNum}
                  </span>
                  <span
                    className={`mt-0.5 text-[11px] ${
                      isSelected ? "text-gray-400" : "text-muted"
                    }`}
                  >
                    {monthName}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Time picker */}
      {selectedDate && (
        <div>
          <div className="flex items-center gap-2.5">
            <ClockIcon className="h-4 w-4 text-muted" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Pilih Jam
            </h3>
          </div>

          {timeSlotsForDate.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Semua jam di tanggal ini sudah terisi.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {timeSlotsForDate.map((slot) => {
                const isSelected =
                  selectedSlot?.datetime === slot.datetime;
                return (
                  <button
                    key={slot.datetime}
                    onClick={() => handleTimeClick(slot)}
                    className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-all ${
                      isSelected
                        ? "border-foreground bg-foreground text-white"
                        : "border-gray-200 bg-white text-foreground hover:border-gray-400"
                    }`}
                  >
                    {slot.time}
                    <span
                      className={`ml-1 text-xs font-normal ${
                        isSelected ? "text-gray-400" : "text-muted"
                      }`}
                    >
                      WIB
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected summary */}
      {selectedSlot && (
        <div className="rounded-lg border border-gray-200 bg-secondary px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted" />
            <span className="font-medium text-foreground">
              {selectedSlot.label}, {selectedSlot.time} WIB
            </span>
            <span className="ml-auto text-xs text-muted">90 menit</span>
          </div>
        </div>
      )}
    </div>
  );
}
