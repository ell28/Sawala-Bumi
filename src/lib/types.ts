export interface BookingSlot {
  date: string;       // e.g. "2025-03-04"
  time: string;       // e.g. "10:00"
  datetime: string;   // ISO 8601 e.g. "2025-03-04T03:00:00.000Z"
  label: string;      // e.g. "Selasa, 4 Mar"
}

export interface BookingFormData {
  full_name: string;
  phone_number: string;
  project_type: "Rumah Baru" | "Renovasi" | "Interior";
  location: string;
  budget_range: "<200jt" | "200-500jt" | "500jt-1M" | ">1M";
  description: string;
}

export interface BookingRequest {
  slot: BookingSlot;
  form: BookingFormData;
}

export type BookingStatus =
  | "PENDING"
  | "PAID"
  | "EXPIRED"
  | "COMPLETED"
  | "CANCELLED";
