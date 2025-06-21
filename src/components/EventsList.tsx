
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { CalendarEvent } from '../types/Event';

interface EventsListProps {
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
  title: string;
}

const EventsList: React.FC<EventsListProps> = ({ events, onEventPress, title }) => {
  const { theme } = useTheme();

  const formatEventTime = (event: CalendarEvent) => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateText = '';
    if (eventDate.toDateString() === today.toDateString()) {
      dateText = 'Today';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      dateText = 'Tomorrow';
    } else {
      dateText = eventDate.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }

    if (event.time) {
      return `${dateText} at ${event.time}`;
    }
    return dateText;
  };

  const renderEventItem = ({ item }: { item: CalendarEvent }) => (
    <TouchableOpacity
      style={[styles.eventItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => onEventPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.eventContent}>
        <Text style={[styles.eventTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        {item.description && (
          <Text style={[styles.eventDescription, { color: theme.colors.textSecondary }]}>
            {item.description}
          </Text>
        )}
        <Text style={[styles.eventTime, { color: theme.colors.textSecondary }]}>
          {formatEventTime(item)}
        </Text>
      </View>
      {item.hasReminder && (
        <View style={[styles.reminderIndicator, { backgroundColor: theme.colors.accent }]} />
      )}
    </TouchableOpacity>
  );

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No events found
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.listTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  listContent: {
    gap: 12,
  },
  eventItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 18,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  reminderIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EventsList;
