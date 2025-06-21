
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  time?: string; // HH:MM format
  hasReminder: boolean;
  reminderMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarkedDate {
  selected?: boolean;
  marked?: boolean;
  selectedColor?: string;
  dots?: Array<{
    key: string;
    color: string;
  }>;
}
