import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import { createCalendarEvent } from "@/lib/google-calendar";
import { createInvoice } from "@/lib/xendit";

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

    // Xendit invoice (create payment link)
    let invoiceUrl: string | null = null;
    try {
      const invoiceResult = await createInvoice({
        bookingId: data.id,
        fullName: form.full_name,
        phoneNumber: form.phone_number,
        email: email || undefined,
      });

      if (invoiceResult) {
        await supabase
          .from("bookings")
          .update({
            xendit_invoice_id: invoiceResult.invoiceId,
            xendit_invoice_url: invoiceResult.invoiceUrl,
          })
          .eq("id", data.id);
        invoiceUrl = invoiceResult.invoiceUrl;
      }
    } catch (invError) {
      console.error("Xendit invoice error (booking still saved):", invError);
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

    return NextResponse.json({
      success: true,
      bookingId: data.id,
      invoiceUrl,
      message: "Booking berhasil dibuat. Menunggu pembayaran.",
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
