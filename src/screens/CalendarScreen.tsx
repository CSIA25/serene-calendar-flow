
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CalendarEvent } from '../types/Event';
import { EventService } from '../services/EventService';
import { NotificationService } from '../services/NotificationService';
import CalendarView from '../components/CalendarView';
import EventModal from '../components/EventModal';
import EventsList from '../components/EventsList';

const CalendarScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [showUpcoming, setShowUpcoming] = useState(false);

  useEffect(() => {
    loadEvents();
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    loadSelectedDateEvents();
  }, [selectedDate, events]);

  useEffect(() => {
    loadUpcomingEvents();
  }, [events]);

  const requestNotificationPermissions = async () => {
    const granted = await NotificationService.requestPermissions();
    if (!granted) {
      alert('Please enable notifications in settings to receive event reminders.');
    }
  };

  const loadEvents = async () => {
    const allEvents = await EventService.getAllEvents();
    setEvents(allEvents);
  };

  const loadSelectedDateEvents = async () => {
    const dateEvents = await EventService.getEventsByDate(selectedDate);
    setSelectedDateEvents(dateEvents);
  };

  const loadUpcomingEvents = async () => {
    const upcoming = await EventService.getUpcomingEvents();
    setUpcomingEvents(upcoming);
  };

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      let savedEvent: CalendarEvent;
      
      if (editingEvent) {
        savedEvent = await EventService.updateEvent(editingEvent.id, eventData) as CalendarEvent;
      } else {
        savedEvent = await EventService.saveEvent(eventData);
      }

      if (savedEvent.hasReminder) {
        await NotificationService.scheduleEventReminder(savedEvent);
      }

      await loadEvents();
      setEditingEvent(undefined);
    } catch (error) {
      alert('Failed to save event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await EventService.deleteEvent(eventId);
      await loadEvents();
      setEditingEvent(undefined);
      setShowEventModal(false);
    } catch (error) {
      alert('Failed to delete event');
    }
  };

  const handleEventPress = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(event.date);
    setShowEventModal(true);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowUpcoming(false);
  };

  const handleNewEvent = () => {
    setEditingEvent(undefined);
    setShowEventModal(true);
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Header */}
      <div 
        className="flex justify-between items-center px-5 py-4"
        style={{ backgroundColor: theme.colors.background }}
      >
        <button
          onClick={() => setShowUpcoming(!showUpcoming)}
          className="px-4 py-2 rounded-full"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <span 
            className="text-sm font-semibold"
            style={{ color: theme.colors.text }}
          >
            {showUpcoming ? 'Calendar' : 'Upcoming'}
          </span>
        </button>
        
        <h1 
          className="text-2xl font-bold"
          style={{ color: theme.colors.text }}
        >
          Calendar
        </h1>
        
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <span className="text-lg">
            {theme.isDark ? '☀️' : '🌙'}
          </span>
        </button>
      </div>

      {showUpcoming ? (
        <EventsList
          events={upcomingEvents}
          onEventPress={handleEventPress}
          title="Upcoming Events"
        />
      ) : (
        <>
          <CalendarView
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            events={events}
          />
          
          <div className="flex-1 pt-2">
            <div className="flex justify-between items-center px-5 pb-2">
              <h2 
                className="text-lg font-semibold"
                style={{ color: theme.colors.text }}
              >
                {new Date(selectedDate).toLocaleDateString([], { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <button
                onClick={handleNewEvent}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <span className="text-white text-xl font-semibold">+</span>
              </button>
            </div>
            
            <EventsList
              events={selectedDateEvents}
              onEventPress={handleEventPress}
              title=""
            />
          </div>
        </>
      )}

      <EventModal
        visible={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEditingEvent(undefined);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        selectedDate={selectedDate}
        editingEvent={editingEvent}
      />
    </div>
  );
};

export default CalendarScreen;
