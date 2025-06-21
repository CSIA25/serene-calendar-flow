
import React from 'react';
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

  if (events.length === 0) {
    return (
      <div className="flex-1 flex justify-center items-center p-10">
        <p 
          className="text-base text-center"
          style={{ color: theme.colors.textSecondary }}
        >
          No events found
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      {title && (
        <h2 
          className="text-xl font-semibold mb-4"
          style={{ color: theme.colors.text }}
        >
          {title}
        </h2>
      )}
      <div className="space-y-3">
        {events.map((event) => (
          <button
            key={event.id}
            className="w-full flex items-center p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 text-left"
            style={{ backgroundColor: theme.colors.surface }}
            onClick={() => onEventPress(event)}
          >
            <div className="flex-1">
              <h3 
                className="font-semibold mb-1"
                style={{ color: theme.colors.text }}
              >
                {event.title}
              </h3>
              {event.description && (
                <p 
                  className="text-sm mb-1.5 leading-relaxed"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {event.description}
                </p>
              )}
              <p 
                className="text-xs font-medium"
                style={{ color: theme.colors.textSecondary }}
              >
                {formatEventTime(event)}
              </p>
            </div>
            {event.hasReminder && (
              <div 
                className="w-2 h-2 rounded-full ml-3"
                style={{ backgroundColor: theme.colors.accent }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EventsList;
