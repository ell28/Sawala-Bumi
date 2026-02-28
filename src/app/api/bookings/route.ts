import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
    const body = await request.json();
    const { slot, form } = body;

    // Server-side validation
    if (!slot?.datetime) {
      return NextResponse.json(
        { error: "Jadwal konsultasi harus dipilih." },
        { status: 400 }
      );
    }

    if (!form?.full_name?.trim()) {
      return NextResponse.json(
        { error: "Nama lengkap harus diisi." },
        { status: 400 }
      );
    }

    if (!form?.phone_number?.trim() || !/^08\d{8,12}$/.test(form.phone_number)) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid." },
        { status: 400 }
      );
    }

    if (!form?.location?.trim()) {
      return NextResponse.json(
        { error: "Lokasi proyek harus diisi." },
        { status: 400 }
      );
    }

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

    // Insert booking
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        full_name: form.full_name.trim(),
        phone_number: form.phone_number.trim(),
        booking_slot: slot.datetime,
        questionnaire_data: {
          project_type: form.project_type,
          location: form.location,
          budget_range: form.budget_range,
          description: form.description,
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

    // TODO: Create Xendit invoice
    // const invoice = await xendit.createInvoice({ ... });

    return NextResponse.json({
      success: true,
      bookingId: data.id,
      message: "Booking berhasil dibuat. Menunggu pembayaran.",
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
