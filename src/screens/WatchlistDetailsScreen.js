import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import StockCard from '../components/StockCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import ApiService from '../services/apiService';

const WatchlistDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { removeFromWatchlist } = useApp();
  const { watchlist } = route.params;

  const [stocks, setStocks] = useState(watchlist.stocks);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (stocks.length > 0) {
      loadStockQuotes();
    }
  }, []);

  const loadStockQuotes = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const quote = await ApiService.getQuote(stock.symbol);
            if (quote['Global Quote']) {
              const quoteData = quote['Global Quote'];
              return {
                ...stock,
                price: quoteData['05. price'],
                change: quoteData['09. change'],
                changePercent: quoteData['10. change percent'],
                volume: quoteData['06. volume'],
              };
            }
            return stock;
          } catch (error) {
            console.error(`Error loading quote for ${stock.symbol}:`, error);
            return stock;
          }
        })
      );

      setStocks(updatedStocks);
    } catch (error) {
      console.error('Error loading stock quotes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemoveStock = (stock) => {
    Alert.alert(
      'Remove Stock',
      `Remove ${stock.symbol} from ${watchlist.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeFromWatchlist(watchlist.id, stock.symbol);
            setStocks(prev => prev.filter(s => s.symbol !== stock.symbol));
          },
        },
      ]
    );
  };

  const handleStockPress = (stock) => {
    navigation.navigate('StockDetails', { 
      symbol: stock.symbol,
      stock 
    });
  };

  const renderStockItem = ({ item }) => (
    <View style={styles.stockItem}>
      <StockCard
        stock={item}
        onPress={() => handleStockPress(item)}
        showWatchlistIcon={false}
      />
      <TouchableOpacity
        style={[styles.removeButton, { backgroundColor: theme.error }]}
        onPress={() => handleRemoveStock(item)}
      >
        <MaterialIcons name="remove" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return <LoadingSpinner message="Loading watchlist..." />;
  }

  if (stocks.length === 0) {
    return (
      <EmptyState
        icon="bookmark-border"
        message="No stocks in this watchlist"
        subtitle="Start adding stocks to track their performance"
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {watchlist.name}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {stocks.length} stock{stocks.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={stocks}
        renderItem={renderStockItem}
        keyExtractor={(item) => `${watchlist.id}_${item.symbol}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadStockQuotes(true)}
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
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 5,
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default WatchlistDetailsScreen;
