
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
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
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications in settings to receive event reminders.'
      );
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
      Alert.alert('Error', 'Failed to save event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await EventService.deleteEvent(eventId);
      await loadEvents();
      setEditingEvent(undefined);
      setShowEventModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete event');
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[styles.viewToggle, { backgroundColor: theme.colors.surface }]}
          onPress={() => setShowUpcoming(!showUpcoming)}
        >
          <Text style={[styles.viewToggleText, { color: theme.colors.text }]}>
            {showUpcoming ? 'Calendar' : 'Upcoming'}
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Calendar
        </Text>
        
        <TouchableOpacity
          style={[styles.themeToggle, { backgroundColor: theme.colors.surface }]}
          onPress={toggleTheme}
        >
          <Text style={[styles.themeToggleText, { color: theme.colors.text }]}>
            {theme.isDark ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
      </View>

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
          
          <View style={styles.selectedDateSection}>
            <View style={styles.selectedDateHeader}>
              <Text style={[styles.selectedDateTitle, { color: theme.colors.text }]}>
                {new Date(selectedDate).toLocaleDateString([], { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleNewEvent}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            <EventsList
              events={selectedDateEvents}
              onEventPress={handleEventPress}
              title=""
            />
          </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  viewToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleText: {
    fontSize: 18,
  },
  selectedDateSection: {
    flex: 1,
    paddingTop: 8,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default CalendarScreen;
