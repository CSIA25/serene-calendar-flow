
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent } from '../types/Event';
import { v4 as uuidv4 } from 'uuid';

const EVENTS_KEY = 'calendar_events';

export class EventService {
  static async getAllEvents(): Promise<CalendarEvent[]> {
    try {
      const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
      return eventsJson ? JSON.parse(eventsJson) : [];
    } catch (error) {
      console.error('Error loading events:', error);
      return [];
    }
  }

  static async getEventsByDate(date: string): Promise<CalendarEvent[]> {
    const events = await this.getAllEvents();
    return events.filter(event => event.date === date);
  }

  static async saveEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    const events = await this.getAllEvents();
    const now = new Date().toISOString();
    
    const newEvent: CalendarEvent = {
      ...event,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    events.push(newEvent);
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    return newEvent;
  }

  static async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const events = await this.getAllEvents();
    const eventIndex = events.findIndex(e => e.id === id);
    
    if (eventIndex === -1) return null;

    events[eventIndex] = {
      ...events[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    return events[eventIndex];
  }

  static async deleteEvent(id: string): Promise<boolean> {
    const events = await this.getAllEvents();
    const filteredEvents = events.filter(e => e.id !== id);
    
    if (filteredEvents.length === events.length) return false;
    
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(filteredEvents));
    return true;
  }

  static async getUpcomingEvents(limit: number = 10): Promise<CalendarEvent[]> {
    const events = await this.getAllEvents();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date + (a.time ? ` ${a.time}` : ''));
        const dateB = new Date(b.date + (b.time ? ` ${b.time}` : ''));
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, limit);
  }
}
