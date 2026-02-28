import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN;

export async function POST(request: NextRequest) {
  // Xendit sends token in x-callback-token. Some proxies/gateways forward it as Authorization.
  const callbackToken =
    request.headers.get("x-callback-token") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!WEBHOOK_TOKEN) {
    console.error("Xendit webhook: XENDIT_WEBHOOK_TOKEN not set");
    return NextResponse.json(
      { code: 500, message: "Webhook not configured" },
      { status: 500 }
    );
  }

  if (!callbackToken || callbackToken !== WEBHOOK_TOKEN) {
    return NextResponse.json(
      { code: 401, message: "Invalid or missing callback token" },
      { status: 401 }
    );
  }

  let body: {
    event?: string;
    id?: string;
    external_id?: string;
    status?: string;
    paid_at?: string;
    created?: string;
    qr_code?: { external_id?: string };
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // QRIS callback: event "qr.payment", status "COMPLETED", external_id in qr_code
  // Invoice callback: status "PAID", external_id at root
  const isQrPaid = body.event === "qr.payment" && body.status === "COMPLETED";
  const isInvoicePaid = body.status === "PAID";

  if (!isQrPaid && !isInvoicePaid) {
    return NextResponse.json({ received: true });
  }

  const externalId = body.qr_code?.external_id ?? body.external_id;
  if (!externalId || !externalId.startsWith("booking-")) {
    return NextResponse.json({ received: true });
  }

  const bookingId = externalId.replace("booking-", "");

  if (!supabaseAdmin) {
    console.error("Xendit webhook: Supabase not configured");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const paidAt = body.paid_at ?? body.created;
  const { error } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "PAID",
      paid_at: paidAt ? new Date(paidAt).toISOString() : new Date().toISOString(),
    })
    .eq("id", bookingId)
    .in("status", ["PENDING"]);

  if (error) {
    console.error("Xendit webhook: Update booking error", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
