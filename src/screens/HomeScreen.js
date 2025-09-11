import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import SearchBar from '../components/SearchBar';
import StockCard from '../components/StockCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import ApiService from '../services/apiService';

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { favorites } = useApp();
  
  // ✅ Initialize as empty arrays to prevent map errors
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await ApiService.getTopGainersLosers();
      
      // ✅ Safe array handling with fallbacks
      if (data && data.top_gainers && data.top_losers) {
        setGainers(Array.isArray(data.top_gainers) ? data.top_gainers.slice(0, 10) : []);
        setLosers(Array.isArray(data.top_losers) ? data.top_losers.slice(0, 10) : []);
      } else {
        setGainers([]);
        setLosers([]);
      }
    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Error', 'Failed to load market data');
      // ✅ Set empty arrays on error
      setGainers([]);
      setLosers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStockPress = (stock) => {
    if (!stock) return;
    navigation.navigate('StockDetails', { 
      symbol: stock.ticker || stock.symbol,
      stock 
    });
  };

  const handleSearchSelect = (stock) => {
    if (!stock || !stock['1. symbol']) return;
    navigation.navigate('StockDetails', { 
      symbol: stock['1. symbol'],
      stock: {
        symbol: stock['1. symbol'],
        name: stock['2. name'],
      }
    });
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.background }]}>
      <View style={styles.headerContent}>
        <View>
          <Text style={[styles.greeting, { color: theme.textMuted }]}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'} Toshan Kanwar 
          </Text>
          <Text style={[styles.greeting, { color: theme.textMuted }]}>
            Kya Haal Chaal Sab Badhiya
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>Markets</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.themeButton, { 
            backgroundColor: theme.surface,
            borderColor: theme.border 
          }]}
          onPress={toggleTheme}
        >
          <MaterialIcons 
            name={isDarkMode ? "light-mode" : "dark-mode"} 
            size={20} 
            color={theme.text} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSection = (title, data, type) => {
    // ✅ Additional safety check
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {title}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ViewAll', { data, title, type })}
            style={styles.viewAllButton}
          >
            <Text style={[styles.viewAllText, { color: theme.primary }]}>
              View All
            </Text>
            <MaterialIcons name="chevron-right" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <StockCard
              stock={item}
              onPress={() => handleStockPress(item)}
              showWatchlistIcon
              isInWatchlist={favorites.has(item?.ticker || item?.symbol)}
            />
          )}
          keyExtractor={(item, index) => `${type}_${item?.ticker || item?.symbol || index}_${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          // ✅ Add error boundary props
          removeClippedSubviews={false}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
        />
      </View>
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Status Bar Background */}
      <View style={[styles.statusBarBg, { backgroundColor: theme.background }]} />
      
      {renderHeader()}
      <SearchBar onStockSelect={handleSearchSelect} />
      
      <FlatList
        // ✅ Safe data for FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <View>
            {/* ✅ Only render sections if data exists */}
            {Array.isArray(gainers) && gainers.length > 0 && 
              renderSection('Top Gainers', gainers, 'gainers')
            }
            {Array.isArray(losers) && losers.length > 0 && 
              renderSection('Top Losers', losers, 'losers')
            }
            
            {/* ✅ Show empty state only when both arrays are empty and not loading */}
            {(!Array.isArray(gainers) || gainers.length === 0) && 
             (!Array.isArray(losers) || losers.length === 0) && 
             !loading && (
              <EmptyState message="No market data available" />
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={[theme.primary]}
            tintColor={theme.primary}
            progressBackgroundColor={theme.cardBackground}
          />
        }
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        // ✅ Add safety props
        removeClippedSubviews={false}
        keyExtractor={(item) => item.key}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarBg: {
    height: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '400',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  horizontalList: {
    paddingLeft: 20,
  },
});

export default HomeScreen;
