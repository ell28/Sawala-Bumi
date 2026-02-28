"use client";

import { useState } from "react";
import { BookingFormData, BookingSlot } from "@/lib/types";
import {
  UserIcon,
  PhoneIcon,
  BriefcaseIcon,
  MapPinIcon,
  BanknotesIcon,
  DocumentIcon,
  CheckCircleIcon,
  SpinnerIcon,
} from "./Icons";

interface BookingFormProps {
  selectedSlot: BookingSlot | null;
}

const PROJECT_TYPES = ["Rumah Baru", "Renovasi", "Interior"] as const;
const BUDGET_RANGES = ["<200jt", "200-500jt", "500jt-1M", ">1M"] as const;

export default function BookingForm({ selectedSlot }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    full_name: "",
    phone_number: "",
    project_type: "Rumah Baru",
    location: "",
    budget_range: "<200jt",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const phoneValid = /^08\d{8,12}$/.test(formData.phone_number);

  const canSubmit =
    selectedSlot &&
    formData.full_name.trim() &&
    formData.phone_number.trim() &&
    phoneValid &&
    formData.location.trim() &&
    !loading;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot: selectedSlot, form: formData }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Gagal menghubungi server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <CheckCircleIcon className="h-14 w-14 text-foreground" />
        <h3 className="mt-5 text-xl font-bold text-foreground">
          Booking Berhasil
        </h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
          Kami akan mengirimkan detail pembayaran via WhatsApp ke{" "}
          <span className="font-medium text-foreground">
            {formData.phone_number}
          </span>
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-secondary px-5 py-2.5 text-sm font-medium text-foreground">
          {selectedSlot?.label}, {selectedSlot?.time} WIB
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2.5">
        <DocumentIcon className="h-4 w-4 text-muted" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          Data Anda
        </h3>
      </div>

      {/* Full Name */}
      <div>
        <label
          htmlFor="full_name"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted"
        >
          Nama Lengkap
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <UserIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            id="full_name"
            name="full_name"
            required
            value={formData.full_name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-gray-300 focus:border-foreground focus:ring-1 focus:ring-foreground"
            placeholder="Masukkan nama lengkap"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone_number"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted"
        >
          Nomor WhatsApp
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <PhoneIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            required
            value={formData.phone_number}
            onChange={handleChange}
            className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-gray-300 focus:ring-1 ${
              formData.phone_number && !phoneValid
                ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                : "border-gray-200 focus:border-foreground focus:ring-foreground"
            }`}
            placeholder="08xxxxxxxxxx"
          />
        </div>
        {formData.phone_number && !phoneValid && (
          <p className="mt-1.5 text-xs text-red-400">
            Format nomor: 08xxxxxxxxxx (10-14 digit)
          </p>
        )}
      </div>

      {/* Two columns: Project Type + Location */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="project_type"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted"
          >
            Tipe Proyek
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <BriefcaseIcon className="h-4 w-4 text-gray-400" />
            </div>
            <select
              id="project_type"
              name="project_type"
              value={formData.project_type}
              onChange={handleChange}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-8 text-sm text-foreground outline-none transition-all focus:border-foreground focus:ring-1 focus:ring-foreground"
            >
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="location"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted"
          >
            Lokasi Proyek
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-gray-300 focus:border-foreground focus:ring-1 focus:ring-foreground"
              placeholder="Jakarta Selatan"
            />
          </div>
        </div>
      </div>

      {/* Budget */}
      <div>
        <label
          htmlFor="budget_range"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted"
        >
          Estimasi Budget
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <BanknotesIcon className="h-4 w-4 text-gray-400" />
          </div>
          <select
            id="budget_range"
            name="budget_range"
            value={formData.budget_range}
            onChange={handleChange}
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-8 text-sm text-foreground outline-none transition-all focus:border-foreground focus:ring-1 focus:ring-foreground"
          >
            {BUDGET_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted"
        >
          <span>Deskripsi Kebutuhan</span>
          <span className="normal-case tracking-normal">
            {formData.description.length}/300
          </span>
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={300}
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-gray-300 focus:border-foreground focus:ring-1 focus:ring-foreground resize-none"
          placeholder="Ceritakan singkat tentang proyek Anda (opsional)"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className={`w-full rounded-full py-3.5 text-sm font-medium tracking-wide transition-all ${
          canSubmit
            ? "bg-foreground text-white hover:bg-primary-light hover:shadow-lg"
            : "cursor-not-allowed bg-gray-200 text-gray-400"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <SpinnerIcon className="h-4 w-4 animate-spin" />
            Memproses...
          </span>
        ) : !selectedSlot ? (
          "Pilih jadwal terlebih dahulu"
        ) : (
          "Konfirmasi Booking"
        )}
      </button>
    </form>
  );
}
