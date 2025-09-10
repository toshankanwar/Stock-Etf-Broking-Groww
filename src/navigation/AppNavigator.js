// src/navigation/AppNavigator.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import StockDetailsScreen from '../screens/StockDetailsScreen';
import ViewAllScreen from '../screens/ViewAllScreen';
import WatchlistDetailsScreen from '../screens/WatchlistDetailsScreen';

import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 🎨 Perfect Navigation Themes (No Flicker)
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#000000',
    border: '#333333',
    primary: '#00D09C',
    text: '#FFFFFF',
  },
};

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E0E0E0',
    primary: '#00D09C',
    text: '#000000',
  },
};

const HomeStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        // 🎯 NO ANIMATIONS - INSTANT NAVIGATION
        animation: 'none',
        gestureEnabled: false,
        headerStyle: { 
          backgroundColor: theme?.background,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTintColor: theme?.text,
        headerTitleStyle: { 
          fontWeight: '600',
          fontSize: 18,
        },
        cardStyle: { 
          backgroundColor: theme?.background 
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Stocks' }}
      />
      <Stack.Screen 
        name="StockDetails" 
        component={StockDetailsScreen}
        options={{ title: 'Stock Details' }}
      />
      <Stack.Screen 
        name="ViewAll" 
        component={ViewAllScreen}
        options={({ route }) => ({ title: route.params?.title || 'All Stocks' })}
      />
    </Stack.Navigator>
  );
};

const WatchlistStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        // 🎯 NO ANIMATIONS - INSTANT NAVIGATION
        animation: 'none',
        gestureEnabled: false,
        headerStyle: { 
          backgroundColor: theme?.background,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTintColor: theme?.text,
        headerTitleStyle: { 
          fontWeight: '600',
          fontSize: 18,
        },
        cardStyle: { 
          backgroundColor: theme?.background 
        },
      }}
    >
      <Stack.Screen 
        name="Watchlist" 
        component={WatchlistScreen}
        options={{ title: 'Watchlists' }}
      />
      <Stack.Screen 
        name="WatchlistDetails" 
        component={WatchlistDetailsScreen}
        options={({ route }) => ({ title: route.params?.watchlist?.name || 'Watchlist' })}
      />
      <Stack.Screen 
        name="StockDetails" 
        component={StockDetailsScreen}
        options={{ title: 'Stock Details' }}
      />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaProvider style={{ backgroundColor: theme?.background }}>
      <View style={{ flex: 1, backgroundColor: theme?.background }}>
        
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              
              if (route.name === 'HomeTab') {
                iconName = 'home';
              } else if (route.name === 'WatchlistTab') {
                iconName = 'bookmark';
              }
              
              return <MaterialIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme?.primary || '#00D09C',
            tabBarInactiveTintColor: theme?.textSecondary || '#757575',
            tabBarStyle: {
              backgroundColor: theme?.background,
              borderTopColor: theme?.border,
              borderTopWidth: 0.5,
              elevation: 0,
              shadowOpacity: 0,
              height: 60,
            },
            headerShown: false,
            // 🎯 ZERO FLICKER CONFIGURATION
            animationEnabled: false,        // No tab switching animations
            lazy: false,                    // Pre-load all tabs
            unmountOnBlur: false,          // Keep tabs mounted
            freezeOnBlur: false,           // Don't freeze tabs
            swipeEnabled: false,           // Disable swipe gestures
            sceneContainerStyle: {
              backgroundColor: theme?.background,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
            tabBarItemStyle: {
              paddingVertical: 5,
            },
          })}
          // Global Tab Navigator options
          initialRouteName="HomeTab"
          backBehavior="none"
          sceneContainerStyle={{
            backgroundColor: theme?.background,
          }}
        >
          <Tab.Screen 
            name="HomeTab" 
            component={HomeStack}
            options={{ 
              tabBarLabel: 'Home',
              // Individual screen options
              animationEnabled: false,
            }}
          />
          <Tab.Screen 
            name="WatchlistTab" 
            component={WatchlistStack}
            options={{ 
              tabBarLabel: 'Watchlist',
              // Individual screen options
              animationEnabled: false,
            }}
          />
        </Tab.Navigator>
      </View>
    </SafeAreaProvider>
  );
};

const AppNavigator = () => {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <NavigationContainer theme={isDarkMode ? CustomDarkTheme : CustomLightTheme}>
      <TabNavigator />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  // Removed fish animation styles - no longer needed
});

export default AppNavigator;
