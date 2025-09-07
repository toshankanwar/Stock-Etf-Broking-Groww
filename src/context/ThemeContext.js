import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const ThemeContext = createContext();

export const lightTheme = {
  primary: '#00D09C',
  primaryDark: '#00B386',
  background: '#FFFFFF',
  surface: '#F7F8FA',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  gainColor: '#10B981',
  lossColor: '#EF4444',
  statusBarStyle: 'dark',
  shadowColor: '#000000',
};

export const darkTheme = {
  primary: '#00D09C',
  primaryDark: '#00B386',
  background: '#0F0F0F',
  surface: '#1A1A1A',
  cardBackground: '#1F1F1F',
  text: '#FFFFFF',
  textSecondary: '#D1D5DB',
  textMuted: '#6B7280',
  border: '#374151',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  gainColor: '#10B981',
  lossColor: '#EF4444',
  statusBarStyle: 'light',
  shadowColor: '#FFFFFF',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      <StatusBar style={theme.statusBarStyle} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
