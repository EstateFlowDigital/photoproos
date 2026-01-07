/**
 * Notification Preferences Constants
 *
 * Default values for notification preferences.
 * These are separated from server actions for use in both server and client.
 */

// Types for notification preferences
export interface NotificationPreferences {
  email: {
    galleryDelivered: boolean;
    galleryViewed: boolean;
    paymentReceived: boolean;
    newBooking: boolean;
    bookingReminder: boolean;
    bookingCanceled: boolean;
    invoiceOverdue: boolean;
    contractSigned: boolean;
    clientFeedback: boolean;
    questionnaireCompleted: boolean;
    // Messaging notifications
    newMessage: boolean;
    chatRequest: boolean;
  };
  push: {
    galleryDelivered: boolean;
    galleryViewed: boolean;
    paymentReceived: boolean;
    newBooking: boolean;
    bookingReminder: boolean;
    bookingCanceled: boolean;
    invoiceOverdue: boolean;
    contractSigned: boolean;
    clientFeedback: boolean;
    questionnaireCompleted: boolean;
    // Messaging notifications
    newMessage: boolean;
    chatRequest: boolean;
  };
}

export interface DigestSettings {
  enabled: boolean;
  frequency: "daily" | "weekly" | "none";
  time: string; // HH:MM format
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
}

export interface QuietHoursSettings {
  enabled: boolean;
  from: string; // HH:MM format
  to: string; // HH:MM format
}

export const defaultNotificationPreferences: NotificationPreferences = {
  email: {
    galleryDelivered: true,
    galleryViewed: true,
    paymentReceived: true,
    newBooking: true,
    bookingReminder: true,
    bookingCanceled: true,
    invoiceOverdue: true,
    contractSigned: true,
    clientFeedback: true,
    questionnaireCompleted: true,
    newMessage: true,
    chatRequest: true,
  },
  push: {
    galleryDelivered: true,
    galleryViewed: false,
    paymentReceived: true,
    newBooking: true,
    bookingReminder: true,
    bookingCanceled: true,
    invoiceOverdue: true,
    contractSigned: true,
    clientFeedback: true,
    questionnaireCompleted: false,
    newMessage: true,
    chatRequest: true,
  },
};

export const defaultDigestSettings: DigestSettings = {
  enabled: true,
  frequency: "daily",
  time: "08:00",
  dayOfWeek: 0, // Sunday
};

export const defaultQuietHours: QuietHoursSettings = {
  enabled: false,
  from: "22:00",
  to: "07:00",
};
