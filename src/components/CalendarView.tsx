
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../contexts/ThemeContext';
import { CalendarEvent, MarkedDate } from '../types/Event';
import { EventService } from '../services/EventService';

interface CalendarViewProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
  events: CalendarEvent[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ onDateSelect, selectedDate, events }) => {
  const { theme } = useTheme();
  const [markedDates, setMarkedDates] = useState<{ [key: string]: MarkedDate }>({});

  useEffect(() => {
    updateMarkedDates();
  }, [events, selectedDate, theme]);

  const updateMarkedDates = () => {
    const marked: { [key: string]: MarkedDate } = {};

    // Mark dates with events
    events.forEach(event => {
      if (!marked[event.date]) {
        marked[event.date] = { dots: [] };
      }
      marked[event.date].dots?.push({
        key: event.id,
        color: theme.colors.primary,
      });
    });

    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: theme.colors.primary,
      };
    }

    setMarkedDates(marked);
  };

  const calendarTheme = {
    backgroundColor: theme.colors.background,
    calendarBackground: theme.colors.background,
    textSectionTitleColor: theme.colors.textSecondary,
    selectedDayBackgroundColor: theme.colors.primary,
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: theme.colors.primary,
    dayTextColor: theme.colors.text,
    textDisabledColor: theme.colors.textSecondary,
    dotColor: theme.colors.primary,
    selectedDotColor: '#FFFFFF',
    arrowColor: theme.colors.primary,
    monthTextColor: theme.colors.text,
    indicatorColor: theme.colors.primary,
    textDayFontFamily: 'System',
    textMonthFontFamily: 'System',
    textDayHeaderFontFamily: 'System',
    textDayFontWeight: '400',
    textMonthFontWeight: '600',
    textDayHeaderFontWeight: '600',
    textDayFontSize: 16,
    textMonthFontSize: 20,
    textDayHeaderFontSize: 14,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Calendar
        onDayPress={(day) => onDateSelect(day.dateString)}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={calendarTheme}
        style={styles.calendar}
        enableSwipeMonths={true}
        hideExtraDays={true}
        firstDay={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    margin: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendar: {
    borderRadius: 20,
    paddingBottom: 16,
  },
});

export default CalendarView;
