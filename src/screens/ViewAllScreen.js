import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';

import StockCard from '../components/StockCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

const ViewAllScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { favorites } = useApp();
  const { data, title, type } = route.params;

  const [stocks, setStocks] = useState(data || []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(false);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  const handleStockPress = (stock) => {
    navigation.navigate('StockDetails', { 
      symbol: stock.ticker || stock.symbol,
      stock 
    });
  };

  const renderStockItem = ({ item, index }) => (
    <View style={styles.stockWrapper}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rank, { color: theme.textSecondary }]}>
          #{index + 1}
        </Text>
      </View>
      <View style={styles.cardContainer}>
        <StockCard
          stock={item}
          onPress={() => handleStockPress(item)}
          showWatchlistIcon
          isInWatchlist={favorites.has(item.ticker || item.symbol)}
        />
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>
        {title}
      </Text>
      <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
        {stocks.length} stocks
      </Text>
    </View>
  );

  if (loading && stocks.length === 0) {
    return <LoadingSpinner message={`Loading ${title.toLowerCase()}...`} />;
  }

  if (stocks.length === 0) {
    return (
      <EmptyState
        icon="show-chart"
        message="No stocks available"
        subtitle="Please try again later"
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={stocks}
        renderItem={renderStockItem}
        keyExtractor={(item, index) => `${type}_${item.ticker || item.symbol}_${index}`}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              // In a real app, you'd reload the data here
              setTimeout(() => setRefreshing(false), 2000);
            }}
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
    paddingBottom: 15,
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
    paddingBottom: 20,
  },
  stockWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContainer: {
    flex: 1,
  },
});

export default ViewAllScreen;
