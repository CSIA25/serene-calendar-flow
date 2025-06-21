
import { CalendarEvent } from '../types/Event';

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async scheduleEventReminder(event: CalendarEvent): Promise<string | null> {
    if (!event.hasReminder || !event.reminderMinutes) return null;

    const eventDateTime = new Date(`${event.date}${event.time ? ` ${event.time}` : ' 09:00'}`);
    const reminderTime = new Date(eventDateTime.getTime() - (event.reminderMinutes * 60 * 1000));
    const now = new Date();

    if (reminderTime <= now) return null;

    try {
      const timeoutId = setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Event Reminder', {
            body: event.title,
            icon: '/favicon.ico',
            tag: event.id,
          });
        }
      }, reminderTime.getTime() - now.getTime());

      // Store the timeout ID for potential cancellation
      const notificationId = `notification_${event.id}_${Date.now()}`;
      localStorage.setItem(notificationId, timeoutId.toString());
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      const timeoutId = localStorage.getItem(notificationId);
      if (timeoutId) {
        clearTimeout(parseInt(timeoutId));
        localStorage.removeItem(notificationId);
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }
}
