
import * as Notifications from 'expo-notifications';
import { CalendarEvent } from '../types/Event';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  static async scheduleEventReminder(event: CalendarEvent): Promise<string | null> {
    if (!event.hasReminder || !event.reminderMinutes) return null;

    const eventDateTime = new Date(`${event.date}${event.time ? ` ${event.time}` : ' 09:00'}`);
    const reminderTime = new Date(eventDateTime.getTime() - (event.reminderMinutes * 60 * 1000));

    if (reminderTime <= new Date()) return null;

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Event Reminder',
          body: event.title,
          data: { eventId: event.id },
        },
        trigger: {
          date: reminderTime,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }
}
