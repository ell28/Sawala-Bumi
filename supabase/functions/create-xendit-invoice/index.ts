import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const XENDIT_QR_API = "https://api.xendit.co/qr_codes";
const QR_AMOUNT = 750_000; // Konsultasi Arsitek 90 Menit

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const secretKey = Deno.env.get("XENDIT_SECRET_KEY");
  if (!secretKey) {
    return new Response(
      JSON.stringify({ error: "Xendit not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body: { bookingId: string; fullName: string; phoneNumber: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { bookingId, fullName, phoneNumber } = body;
  if (!bookingId || !fullName || !phoneNumber) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: bookingId, fullName, phoneNumber" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const appUrl = Deno.env.get("APP_URL") || Deno.env.get("NEXT_PUBLIC_APP_URL") || "http://localhost:3000";
  const externalId = `booking-${bookingId}`;
  const callbackUrl = `${appUrl}/api/webhooks/xendit`;

  const formBody = new URLSearchParams({
    external_id: externalId,
    type: "DYNAMIC",
    callback_url: callbackUrl,
    amount: String(QR_AMOUNT),
  });

  try {
    const response = await fetch(XENDIT_QR_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(secretKey + ":")}`,
      },
      body: formBody.toString(),
    });

    const qr = await response.json();

    if (!response.ok || !qr.id || !qr.qr_string) {
      console.error("Xendit QR API error:", qr);
      return new Response(
        JSON.stringify({ error: "Failed to create QR code", details: qr }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { error } = await supabase
        .from("bookings")
        .update({
          xendit_invoice_id: qr.id,
          xendit_invoice_url: qr.qr_string,
        })
        .eq("id", bookingId);

      if (error) {
        console.error("Supabase update error:", error);
      }
    }

    return new Response(
      JSON.stringify({
        qrId: qr.id,
        qrString: qr.qr_string,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-xendit-qr error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
