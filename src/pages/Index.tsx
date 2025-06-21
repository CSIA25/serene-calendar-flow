
import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import CalendarScreen from '../screens/CalendarScreen';

const Index = () => {
  return (
    <ThemeProvider>
      <CalendarScreen />
    </ThemeProvider>
  );
};

export default Index;
