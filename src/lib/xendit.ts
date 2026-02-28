import Xendit from "xendit-node";

const secretKey = process.env.XENDIT_SECRET_KEY;
const xendit =
  secretKey ? new Xendit({ secretKey }) : null;

const INVOICE_AMOUNT = 750_000;
const INVOICE_DURATION = 86400; // 24 hours

function formatPhoneForXendit(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    return `+62${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("62")) {
    return `+${cleaned}`;
  }
  return `+62${cleaned}`;
}

export interface CreateInvoiceParams {
  bookingId: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
}

export async function createInvoice(params: CreateInvoiceParams): Promise<{
  invoiceId: string;
  invoiceUrl: string;
} | null> {
  if (!xendit) {
    console.error("Xendit: XENDIT_SECRET_KEY not configured");
    return null;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const externalId = `booking-${params.bookingId}`;

  try {
    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId,
        amount: INVOICE_AMOUNT,
        description: "Konsultasi Arsitek 90 Menit - Sawala Bumi",
        invoiceDuration: INVOICE_DURATION,
        currency: "IDR",
        customer: {
          givenNames: params.fullName.split(" ")[0] || params.fullName,
          surname: params.fullName.split(" ").slice(1).join(" ") || "",
          email: params.email || `guest-${params.bookingId}@sawala-bumi.com`,
          mobileNumber: formatPhoneForXendit(params.phoneNumber),
        },
        successRedirectUrl: `${baseUrl}/#booking?paid=1`,
        failureRedirectUrl: `${baseUrl}/#booking?failed=1`,
        items: [
          {
            name: "Konsultasi Arsitek 90 Menit",
            quantity: 1,
            price: INVOICE_AMOUNT,
            category: "Konsultasi",
          },
        ],
      },
    });

    if (!invoice.id || !invoice.invoiceUrl) {
      console.error("Xendit: Invalid invoice response", invoice);
      return null;
    }

    return {
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoiceUrl,
    };
  } catch (err) {
    console.error("Xendit createInvoice error:", err);
    return null;
  }
}
