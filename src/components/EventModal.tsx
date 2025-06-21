
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(15);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setHasTime(!!editingEvent.time);
      if (editingEvent.time) {
        const [hours, minutes] = editingEvent.time.split(':');
        const timeDate = new Date();
        timeDate.setHours(parseInt(hours), parseInt(minutes));
        setTime(timeDate);
      }
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
    setTime(new Date());
    setHasReminder(false);
    setReminderMinutes(15);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the event');
      return;
    }

    const timeString = hasTime ? 
      `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}` : 
      undefined;

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      date: selectedDate,
      time: timeString,
      hasReminder,
      reminderMinutes: hasReminder ? reminderMinutes : undefined,
    };

    onSave(eventData);
    onClose();
    resetForm();
  };

  const handleDelete = () => {
    if (editingEvent && onDelete) {
      Alert.alert(
        'Delete Event',
        'Are you sure you want to delete this event?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(editingEvent.id) },
        ]
      );
    }
  };

  const reminderOptions = [
    { label: '5 minutes', value: 5 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '1 day', value: 1440 },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelButton, { color: theme.colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {editingEvent ? 'Edit Event' : 'New Event'}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.saveButton, { color: theme.colors.primary }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Event title"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { color: theme.colors.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Event description (optional)"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.switchRow}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Add Time</Text>
              <Switch
                value={hasTime}
                onValueChange={setHasTime}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.background}
              />
            </View>
            {hasTime && (
              <TouchableOpacity
                style={[styles.timeButton, { borderColor: theme.colors.border }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={[styles.timeText, { color: theme.colors.text }]}>
                  {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.switchRow}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Reminder</Text>
              <Switch
                value={hasReminder}
                onValueChange={setHasReminder}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.background}
              />
            </View>
            {hasReminder && (
              <View style={styles.reminderOptions}>
                {reminderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.reminderOption,
                      { backgroundColor: reminderMinutes === option.value ? theme.colors.primary : 'transparent' }
                    ]}
                    onPress={() => setReminderMinutes(option.value)}
                  >
                    <Text
                      style={[
                        styles.reminderText,
                        { 
                          color: reminderMinutes === option.value ? '#FFFFFF' : theme.colors.text 
                        }
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {editingEvent && onDelete && (
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>Delete Event</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setTime(selectedTime);
              }
            }}
          />
        )}
      </View>
    </Modal>
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
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
  },
  textArea: {
    fontSize: 16,
    paddingVertical: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  reminderOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reminderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventModal;
