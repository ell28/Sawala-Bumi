"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { BookingFormData, BookingSlot } from "@/lib/types";
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentIcon,
  CameraIcon,
  CheckCircleIcon,
  SpinnerIcon,
} from "./Icons";

interface BookingFormProps {
  selectedSlot: BookingSlot | null;
  utmSource?: string;
  utmCampaign?: string;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;
const ACCEPT_TYPES = "image/*,video/*";

export default function BookingForm({ selectedSlot, utmSource, utmCampaign }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    full_name: "",
    phone_number: "",
    email: "",
    problem: "",
    media_urls: [],
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrString, setQrString] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const phoneValid = /^08\d{8,12}$/.test(formData.phone_number);
  const emailValid =
    formData.email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const canSubmit =
    selectedSlot &&
    formData.full_name.trim() &&
    formData.phone_number.trim() &&
    phoneValid &&
    formData.email.trim() &&
    emailValid &&
    formData.problem.trim() &&
    !loading;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid: File[] = [];
    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;

    for (const file of files) {
      if (file.size > maxBytes) continue;
      if (valid.length >= MAX_FILES) break;
      valid.push(file);
    }

    setMediaFiles((prev) => {
      const combined = [...prev, ...valid].slice(0, MAX_FILES);
      return combined;
    });
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !selectedSlot) return;

    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("slot", JSON.stringify(selectedSlot));
      formDataToSend.append("full_name", formData.full_name.trim());
      formDataToSend.append("phone_number", formData.phone_number.trim());
      formDataToSend.append("email", formData.email.trim());
      formDataToSend.append("problem", formData.problem.trim());

      mediaFiles.forEach((file) => {
        formDataToSend.append("media", file);
      });

      if (utmSource) formDataToSend.append("utm_source", utmSource);
      if (utmCampaign) formDataToSend.append("utm_campaign", utmCampaign);

      const res = await fetch("/api/bookings", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }

      setQrString(
        data.qrString &&
          typeof data.qrString === "string" &&
          data.qrString.length >= 50 &&
          /\d/.test(data.qrString)
          ? data.qrString
          : null
      );
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
          {qrString
            ? "Scan QR code di bawah dengan aplikasi e-wallet atau mobile banking untuk membayar Rp 750.000."
            : "Kami akan mengirimkan detail pembayaran via WhatsApp ke "}
          {!qrString && (
            <span className="font-medium text-foreground">
              {formData.phone_number}
            </span>
          )}
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-secondary px-5 py-2.5 text-sm font-medium text-foreground">
          {selectedSlot?.label}, {selectedSlot?.time} WIB
        </div>
        {qrString && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6">
            <QRCodeSVG value={qrString} size={220} level="M" />
            <p className="text-xs text-muted">
              Scan dengan OVO, GoPay, DANA, atau mobile banking
            </p>
          </div>
        )}
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

      {/* Nama */}
      <div>
        <label
          htmlFor="full_name"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted"
        >
          Nama
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

      {/* Telp/WA */}
      <div>
        <label
          htmlFor="phone_number"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted"
        >
          Telp/WA
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

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted"
        >
          Email
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-gray-300 focus:ring-1 ${
              formData.email && !emailValid
                ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                : "border-gray-200 focus:border-foreground focus:ring-foreground"
            }`}
            placeholder="email@contoh.com"
          />
        </div>
        {formData.email && !emailValid && (
          <p className="mt-1.5 text-xs text-red-400">Format email tidak valid</p>
        )}
      </div>

      {/* Problem */}
      <div>
        <label
          htmlFor="problem"
          className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted"
        >
          <span>Problem</span>
          <span className="normal-case tracking-normal">
            {formData.problem.length}/500
          </span>
        </label>
        <textarea
          id="problem"
          name="problem"
          required
          maxLength={500}
          rows={4}
          value={formData.problem}
          onChange={handleChange}
          className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-gray-300 focus:border-foreground focus:ring-1 focus:ring-foreground"
          placeholder="Ceritakan masalah atau kebutuhan Anda terkait ruangan/rumah..."
        />
      </div>

      {/* Foto/Video ruangan/rumah */}
      <div>
        <label
          htmlFor="media"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted"
        >
          Foto/Video ruangan/rumah
        </label>
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            id="media"
            name="media"
            accept={ACCEPT_TYPES}
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-2.5 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-4 px-4 text-sm text-muted transition-colors hover:border-foreground hover:bg-gray-100"
          >
            <CameraIcon className="h-5 w-5 shrink-0" />
            <span>
              {mediaFiles.length > 0
                ? `Tambahkan lagi (${mediaFiles.length}/${MAX_FILES})`
                : `Pilih foto atau video (max ${MAX_FILES} file, ${MAX_FILE_SIZE_MB}MB/file)`}
            </span>
          </button>
          {mediaFiles.length > 0 && (
            <ul className="space-y-2">
              {mediaFiles.map((file, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <span className="truncate text-foreground">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="shrink-0 text-red-500 hover:text-red-600"
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
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
