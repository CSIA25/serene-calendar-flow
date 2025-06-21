
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CalendarEvent } from '../types/Event';

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: (id: string) => void;
  selectedDate: string;
  editingEvent?: CalendarEvent;
}

const EventModal: React.FC<EventModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  editingEvent,
}) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasTime, setHasTime] = useState(false);
  const [time, setTime] = useState('09:00');
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(15);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setHasTime(!!editingEvent.time);
      setTime(editingEvent.time || '09:00');
      setHasReminder(editingEvent.hasReminder);
      setReminderMinutes(editingEvent.reminderMinutes || 15);
    } else {
      resetForm();
    }
  }, [editingEvent, visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setHasTime(false);
    setTime('09:00');
    setHasReminder(false);
    setReminderMinutes(15);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title for the event');
      return;
    }

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      date: selectedDate,
      time: hasTime ? time : undefined,
      hasReminder,
      reminderMinutes: hasReminder ? reminderMinutes : undefined,
    };

    onSave(eventData);
    onClose();
    resetForm();
  };

  const handleDelete = () => {
    if (editingEvent && onDelete) {
      if (confirm('Are you sure you want to delete this event?')) {
        onDelete(editingEvent.id);
      }
    }
  };

  const reminderOptions = [
    { label: '5 minutes', value: 5 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '1 day', value: 1440 },
  ];

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-md max-h-[90vh] rounded-2xl overflow-hidden"
        style={{ backgroundColor: theme.colors.background }}
      >
        {/* Header */}
        <div 
          className="flex justify-between items-center px-5 py-4 border-b"
          style={{ borderBottomColor: theme.colors.border }}
        >
          <button 
            onClick={onClose}
            className="text-base"
            style={{ color: theme.colors.textSecondary }}
          >
            Cancel
          </button>
          <h2 
            className="text-lg font-semibold"
            style={{ color: theme.colors.text }}
          >
            {editingEvent ? 'Edit Event' : 'New Event'}
          </h2>
          <button 
            onClick={handleSave}
            className="text-base font-semibold"
            style={{ color: theme.colors.primary }}
          >
            Save
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-5 space-y-4">
          {/* Title */}
          <div 
            className="rounded-xl p-4"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.textSecondary }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full text-base py-2 bg-transparent outline-none"
              style={{ color: theme.colors.text }}
            />
          </div>

          {/* Description */}
          <div 
            className="rounded-xl p-4"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.textSecondary }}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description (optional)"
              className="w-full text-base py-2 bg-transparent outline-none resize-none h-20"
              style={{ color: theme.colors.text }}
            />
          </div>

          {/* Time */}
          <div 
            className="rounded-xl p-4"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <div className="flex justify-between items-center mb-3">
              <label 
                className="text-base font-medium"
                style={{ color: theme.colors.text }}
              >
                Add Time
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTime}
                  onChange={(e) => setHasTime(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {hasTime && (
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-3 border rounded-lg text-base"
                style={{ 
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: 'transparent'
                }}
              />
            )}
          </div>

          {/* Reminder */}
          <div 
            className="rounded-xl p-4"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <div className="flex justify-between items-center mb-3">
              <label 
                className="text-base font-medium"
                style={{ color: theme.colors.text }}
              >
                Reminder
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReminder}
                  onChange={(e) => setHasReminder(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {hasReminder && (
              <div className="flex flex-wrap gap-2 mt-3">
                {reminderOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setReminderMinutes(option.value)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: reminderMinutes === option.value ? theme.colors.primary : 'transparent',
                      color: reminderMinutes === option.value ? '#FFFFFF' : theme.colors.text,
                      border: `1px solid ${reminderMinutes === option.value ? 'transparent' : theme.colors.border}`
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delete Button */}
          {editingEvent && onDelete && (
            <button
              onClick={handleDelete}
              className="w-full rounded-xl p-4 text-white font-semibold mt-5"
              style={{ backgroundColor: theme.colors.error }}
            >
              Delete Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
