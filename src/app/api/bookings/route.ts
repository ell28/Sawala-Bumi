import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import { createCalendarEvent } from "@/lib/google-calendar";
import { sendBookingConfirmation } from "@/lib/email";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

async function uploadMediaFiles(files: File[]): Promise<string[]> {
  if (!supabaseAdmin || files.length === 0) return [];

  const urls: string[] = [];

  for (let i = 0; i < Math.min(files.length, MAX_FILES); i++) {
    const file = files[i];
    if (file.size > MAX_FILE_SIZE) continue;

    const ext = file.name.split(".").pop() || "bin";
    const path = `${Date.now()}-${i}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    urls.push(publicUrl);
  }

  return urls;
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ bookedSlots: [] });
  }

  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("booking_slot")
      .in("status", ["PENDING", "PAID"]);

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({ bookedSlots: [] });
    }

    const bookedSlots = data.map((row) => row.booking_slot);
    return NextResponse.json({ bookedSlots });
  } catch {
    return NextResponse.json({ bookedSlots: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let slot: { datetime?: string } | null = null;
    let form: Record<string, unknown> = {};
    let mediaFiles: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const slotStr = formData.get("slot");
      if (typeof slotStr === "string") {
        try {
          slot = JSON.parse(slotStr) as { datetime?: string };
        } catch {
          slot = null;
        }
      }
      form = {
        full_name: formData.get("full_name")?.toString()?.trim() ?? "",
        phone_number: formData.get("phone_number")?.toString()?.trim() ?? "",
        email: formData.get("email")?.toString()?.trim() ?? "",
        problem: formData.get("problem")?.toString()?.trim() ?? "",
        utm_source: formData.get("utm_source")?.toString()?.trim() ?? "",
        utm_campaign: formData.get("utm_campaign")?.toString()?.trim() ?? "",
      };
      const media = formData.getAll("media");
      mediaFiles = media.filter((f): f is File => f instanceof File);
    } else {
      const body = await request.json();
      slot = body.slot ?? null;
      form = body.form ?? {};
    }

    // Server-side validation
    if (!slot?.datetime) {
      return NextResponse.json(
        { error: "Jadwal konsultasi harus dipilih." },
        { status: 400 }
      );
    }

    if (!form.full_name || typeof form.full_name !== "string") {
      return NextResponse.json(
        { error: "Nama harus diisi." },
        { status: 400 }
      );
    }

    if (
      !form.phone_number ||
      typeof form.phone_number !== "string" ||
      !/^08\d{8,12}$/.test(form.phone_number)
    ) {
      return NextResponse.json(
        { error: "Nomor Telp/WA tidak valid." },
        { status: 400 }
      );
    }

    if (!form.problem || typeof form.problem !== "string") {
      return NextResponse.json(
        { error: "Problem harus diisi." },
        { status: 400 }
      );
    }

    const email = typeof form.email === "string" ? form.email.trim() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email harus diisi dengan format yang valid." },
        { status: 400 }
      );
    }
    const utmSource = typeof form.utm_source === "string" ? form.utm_source : "";
    const utmCampaign = typeof form.utm_campaign === "string" ? form.utm_campaign : "";

    if (!supabase) {
      return NextResponse.json(
        { error: "Database belum terhubung." },
        { status: 503 }
      );
    }

    // Check if slot is already taken
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("booking_slot", slot.datetime)
      .in("status", ["PENDING", "PAID"])
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Jadwal ini sudah dipesan. Silakan pilih jadwal lain." },
        { status: 409 }
      );
    }

    // Upload media files
    const mediaUrls = await uploadMediaFiles(mediaFiles);

    // Insert booking
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        full_name: form.full_name,
        phone_number: form.phone_number,
        email: email || null,
        booking_slot: slot.datetime,
        questionnaire_data: {
          problem: form.problem,
          media_urls: mediaUrls,
        },
        status: "PENDING",
        utm_source: utmSource || null,
        utm_campaign: utmCampaign || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Gagal menyimpan booking. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // Xendit QRIS via Supabase Edge Function (create QR code)
    let qrString: string | null = null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceRoleKey) {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/create-xendit-invoice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            bookingId: data.id,
            fullName: form.full_name,
            phoneNumber: form.phone_number,
            email: email || undefined,
          }),
        });
    const qrResult = await res.json();
        // Hanya pakai qrString jika dari Xendit dan mirip payload QRIS (panjang, ada angka)
        const raw = qrResult.qrString;
        const isValidQRIS =
          typeof raw === "string" &&
          raw.length >= 50 &&
          /\d/.test(raw);
        if (isValidQRIS) {
          qrString = raw;
        }
      } catch (qrError) {
        console.error("Xendit QR error (booking still saved):", qrError);
      }
    }

    // Google Calendar event (non-blocking)
    try {
      const calendarResult = await createCalendarEvent({
        clientName: form.full_name,
        bookingSlot: slot.datetime,
        email,
        problem: form.problem,
        phoneNumber: form.phone_number,
      });

      if (calendarResult.eventId) {
        await supabase
          .from("bookings")
          .update({ google_event_id: calendarResult.eventId })
          .eq("id", data.id);
      }
    } catch (calError) {
      console.error("Google Calendar error (booking still saved):", calError);
    }

    // Send booking confirmation email (non-blocking)
    sendBookingConfirmation({
      fullName: form.full_name as string,
      email,
      bookingSlot: slot.datetime,
      problem: form.problem as string,
    }).catch((err) =>
      console.error("Booking confirmation email error:", err)
    );

    return NextResponse.json({
      success: true,
      bookingId: data.id,
      qrString,
      message: "Booking berhasil dibuat. Scan QR untuk pembayaran.",
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
