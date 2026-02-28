import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "Sawala Bumi <onboarding@resend.dev>";

function formatSlotLabel(datetime: string): string {
  const date = new Date(datetime);
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const day = days[date.getDay()];
  const d = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}, ${d} ${month} ${year} — ${hours}:${minutes} WIB`;
}

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background-color:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5F5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#FFFFFF;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#111111;padding:24px 32px;">
              <h1 style="margin:0;color:#FFFFFF;font-size:18px;font-weight:700;letter-spacing:0.5px;">SAWALA BUMI</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #E5E5E5;">
              <p style="margin:0;font-size:12px;color:#888888;line-height:1.5;">
                Email ini dikirim otomatis oleh Sawala Bumi.<br/>
                Jika ada pertanyaan, hubungi kami via WhatsApp.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

interface BookingConfirmationParams {
  fullName: string;
  email: string;
  bookingSlot: string;
  problem: string;
}

export async function sendBookingConfirmation({
  fullName,
  email,
  bookingSlot,
  problem,
}: BookingConfirmationParams): Promise<void> {
  if (!resend) {
    console.warn("Resend not configured, skipping booking confirmation email");
    return;
  }

  const slotLabel = formatSlotLabel(bookingSlot);
  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#111111;font-weight:700;">Booking Berhasil Dibuat</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#555555;line-height:1.6;">
      Halo <strong>${fullName}</strong>,<br/>
      Terima kasih telah melakukan booking konsultasi di Sawala Bumi. Berikut detail booking Anda:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5F5;border-radius:6px;padding:20px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:1px;">Jadwal Konsultasi</p>
          <p style="margin:0 0 16px;font-size:15px;color:#111111;font-weight:600;">${slotLabel}</p>
          <p style="margin:0 0 8px;font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:1px;">Problem</p>
          <p style="margin:0;font-size:14px;color:#333333;line-height:1.5;">${problem}</p>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFDE7;border:1px solid #FFF9C4;border-radius:6px;padding:16px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:13px;color:#F57F17;font-weight:600;">Menunggu Pembayaran</p>
          <p style="margin:0;font-size:13px;color:#555555;line-height:1.5;">
            Silakan selesaikan pembayaran QRIS sebesar <strong>Rp 750.000</strong> melalui halaman booking.
            Booking akan otomatis dikonfirmasi setelah pembayaran berhasil.
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#888888;">
      Jika Anda tidak merasa melakukan booking ini, silakan abaikan email ini.
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Booking Konsultasi Anda — Sawala Bumi",
      html,
    });
  } catch (err) {
    console.error("Failed to send booking confirmation email:", err);
  }
}

interface PaymentSuccessParams {
  fullName: string;
  email: string;
  bookingSlot: string;
}

export async function sendPaymentSuccess({
  fullName,
  email,
  bookingSlot,
}: PaymentSuccessParams): Promise<void> {
  if (!resend) {
    console.warn("Resend not configured, skipping payment success email");
    return;
  }

  const slotLabel = formatSlotLabel(bookingSlot);
  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#111111;font-weight:700;">Pembayaran Berhasil</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#555555;line-height:1.6;">
      Halo <strong>${fullName}</strong>,<br/>
      Pembayaran untuk konsultasi Anda telah berhasil dikonfirmasi. Berikut detail jadwal konsultasi Anda:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5F5;border-radius:6px;padding:20px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:1px;">Jadwal Konsultasi</p>
          <p style="margin:0;font-size:15px;color:#111111;font-weight:600;">${slotLabel}</p>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#E8F5E9;border:1px solid #C8E6C9;border-radius:6px;padding:16px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:13px;color:#2E7D32;font-weight:600;">Terkonfirmasi</p>
          <p style="margin:0;font-size:13px;color:#555555;line-height:1.5;">
            Booking Anda telah terkonfirmasi. Tim kami akan menghubungi Anda sebelum jadwal konsultasi.
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#888888;">
      Sampai jumpa di sesi konsultasi!
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Pembayaran Berhasil — Sawala Bumi",
      html,
    });
  } catch (err) {
    console.error("Failed to send payment success email:", err);
  }
}
