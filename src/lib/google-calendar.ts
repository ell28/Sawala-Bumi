import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

function getCalendarClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!email || !key || !calendarId) {
    return null;
  }

  const auth = new google.auth.JWT({ email, key, scopes: SCOPES });
  const calendar = google.calendar({ version: "v3", auth });

  return { calendar, calendarId };
}

interface CreateEventParams {
  clientName: string;
  bookingSlot: string; // ISO 8601
  email: string;
  problem: string;
  phoneNumber: string;
}

export async function createCalendarEvent(
  params: CreateEventParams
): Promise<{ eventId: string | null; meetLink: string | null }> {
  const client = getCalendarClient();
  if (!client) {
    throw new Error("Google Calendar not configured");
  }

  const { calendar, calendarId } = client;

  const startTime = new Date(params.bookingSlot);
  const endTime = new Date(startTime.getTime() + 90 * 60 * 1000); // 90 minutes

  const descriptionLines = [
    `WhatsApp: ${params.phoneNumber}`,
    params.email ? `Email: ${params.email}` : null,
    "",
    `Problem:`,
    params.problem || "-",
  ].filter(Boolean) as string[];

  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `Konsultasi Arsitek - ${params.clientName}`,
      description: descriptionLines.join("\n"),
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "Asia/Jakarta",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "Asia/Jakarta",
      },
    },
  });

  const eventId = response.data.id ?? null;
  const meetLink = (response.data as { hangoutLink?: string }).hangoutLink ?? null;

  return { eventId, meetLink };
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const client = getCalendarClient();
  if (!client) {
    throw new Error("Google Calendar not configured");
  }

  const { calendar, calendarId } = client;

  try {
    await calendar.events.delete({ calendarId, eventId });
  } catch (error: unknown) {
    const status = (error as { code?: number }).code;
    if (status === 404 || status === 410) {
      return; // Already deleted — idempotent
    }
    throw error;
  }
}
