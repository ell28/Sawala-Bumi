import { BookingSlot } from "./types";

const DAY_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

// Available days: Selasa (2) and Kamis (4)
const AVAILABLE_DAYS = [2, 4];

// Available time slots (WIB = UTC+7)
const AVAILABLE_TIMES = ["10:00", "13:00", "15:00"];

// WIB offset in hours
const WIB_OFFSET = 7;

/**
 * Generate available booking slots for the next 14 days.
 * Only Selasa (Tuesday) and Kamis (Thursday), times: 10:00, 13:00, 15:00 WIB.
 * Each slot = 90 min + 30 min buffer = 2 hours.
 *
 * Later: filter out slots already booked (PENDING/PAID) from Supabase.
 */
export function generateAvailableSlots(): BookingSlot[] {
  const slots: BookingSlot[] = [];
  const now = new Date();

  for (let i = 1; i <= 14; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);

    const dayOfWeek = date.getDay();
    if (!AVAILABLE_DAYS.includes(dayOfWeek)) continue;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const dayName = DAY_NAMES[dayOfWeek];
    const monthName = MONTH_NAMES[date.getMonth()];
    const label = `${dayName}, ${date.getDate()} ${monthName}`;

    for (const time of AVAILABLE_TIMES) {
      const [hours, minutes] = time.split(":").map(Number);
      // Convert WIB to UTC for ISO string
      const utcDate = new Date(
        Date.UTC(year, date.getMonth(), date.getDate(), hours - WIB_OFFSET, minutes)
      );

      slots.push({
        date: dateStr,
        time,
        datetime: utcDate.toISOString(),
        label,
      });
    }
  }

  return slots;
}

/**
 * Group slots by date for the date picker.
 */
export function groupSlotsByDate(
  slots: BookingSlot[]
): Map<string, BookingSlot[]> {
  const grouped = new Map<string, BookingSlot[]>();

  for (const slot of slots) {
    const existing = grouped.get(slot.date) || [];
    existing.push(slot);
    grouped.set(slot.date, existing);
  }

  return grouped;
}
