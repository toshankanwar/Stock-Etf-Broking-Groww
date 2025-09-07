import React from 'react';
import { LogBox } from 'react-native';
import 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppProvider } from './src/context/AppContext';

// Ignore specific warnings for cleaner development
LogBox.ignoreLogs([
  'Warning: Cannot read property',
  'Require cycle:',
  'StatusBar backgroundColor',
]);

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </ThemeProvider>
  );
}
