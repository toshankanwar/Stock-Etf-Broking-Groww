import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import StockDetailsScreen from '../screens/StockDetailsScreen';
import ViewAllScreen from '../screens/ViewAllScreen';
import WatchlistDetailsScreen from '../screens/WatchlistDetailsScreen';

import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: 'bold' },
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
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: 'bold' },
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
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="WatchlistTab" 
        component={WatchlistStack}
        options={{ tabBarLabel: 'Watchlist' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer
      theme={{
        colors: {
          primary: theme.primary,
          background: theme.background,
          card: theme.cardBackground,
          text: theme.text,
          border: theme.border,
          notification: theme.primary,
        },
      }}
    >
      <TabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
