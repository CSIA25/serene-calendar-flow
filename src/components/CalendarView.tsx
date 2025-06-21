
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useTheme } from '../contexts/ThemeContext';
import { CalendarEvent, MarkedDate } from '../types/Event';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
  events: CalendarEvent[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ onDateSelect, selectedDate, events }) => {
  const { theme } = useTheme();
  const [selectedDateObj, setSelectedDateObj] = useState<Date | undefined>();

  useEffect(() => {
    if (selectedDate) {
      setSelectedDateObj(new Date(selectedDate));
    }
  }, [selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      onDateSelect(dateString);
      setSelectedDateObj(date);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  return (
    <div 
      className="rounded-3xl mx-4 shadow-lg p-4"
      style={{ backgroundColor: theme.colors.background }}
    >
      <Calendar
        mode="single"
        selected={selectedDateObj}
        onSelect={handleDateSelect}
        className={cn(
          "w-full pointer-events-auto",
          theme.isDark ? "dark" : ""
        )}
        modifiers={{
          hasEvents: (date) => hasEvents(date),
        }}
        modifiersStyles={{
          hasEvents: {
            backgroundColor: theme.colors.accent + '20',
            borderRadius: '50%',
          },
        }}
        style={{
          '--calendar-bg': theme.colors.background,
          '--calendar-text': theme.colors.text,
          '--calendar-primary': theme.colors.primary,
        } as React.CSSProperties}
      />
    </div>
  );
};

export default CalendarView;
