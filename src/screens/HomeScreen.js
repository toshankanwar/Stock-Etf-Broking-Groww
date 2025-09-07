import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import SearchBar from '../components/SearchBar';
import StockCard from '../components/StockCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import ApiService from '../services/apiService';

const HomeScreen = ({ navigation }) => {
  const { theme, toggleTheme } = useTheme();
  const { favorites } = useApp();
  
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
      
      if (data.top_gainers && data.top_losers) {
        setGainers(data.top_gainers.slice(0, 10));
        setLosers(data.top_losers.slice(0, 10));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load market data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStockPress = (stock) => {
    navigation.navigate('StockDetails', { 
      symbol: stock.ticker || stock.symbol,
      stock 
    });
  };

  const handleSearchSelect = (stock) => {
    navigation.navigate('StockDetails', { 
      symbol: stock['1. symbol'],
      stock: {
        symbol: stock['1. symbol'],
        name: stock['2. name'],
      }
    });
  };

  const renderSection = (title, data, type) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {title}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ViewAll', { data, title, type })}
        >
          <Text style={[styles.viewAll, { color: theme.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <StockCard
            stock={item}
            onPress={() => handleStockPress(item)}
            showWatchlistIcon
            isInWatchlist={favorites.has(item.ticker || item.symbol)}
          />
        )}
        keyExtractor={(item, index) => `${type}_${item.ticker || item.symbol}_${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Markets
        </Text>
        <TouchableOpacity onPress={toggleTheme}>
          <Icon 
            name="brightness-6" 
            size={24} 
            color={theme.text} 
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <>
            <SearchBar onStockSelect={handleSearchSelect} />
            
            {gainers.length > 0 && renderSection('Top Gainers', gainers, 'gainers')}
            {losers.length > 0 && renderSection('Top Losers', losers, 'losers')}
            
            {gainers.length === 0 && losers.length === 0 && (
              <EmptyState message="No market data available" />
            )}
          </>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 16,
    fontWeight: '600',
  },
  horizontalList: {
    paddingLeft: 7,
  },
});

export default HomeScreen;
