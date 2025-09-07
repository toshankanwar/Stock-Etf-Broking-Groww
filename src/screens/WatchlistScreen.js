import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import EmptyState from '../components/EmptyState';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

const WatchlistScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { watchlists, deleteWatchlist } = useApp();

  const handleDeleteWatchlist = (watchlistId, watchlistName) => {
    Alert.alert(
      'Delete Watchlist',
      `Are you sure you want to delete "${watchlistName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWatchlist(watchlistId),
        },
      ]
    );
  };

  const renderWatchlistItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.watchlistCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      onPress={() => navigation.navigate('WatchlistDetails', { watchlist: item })}
    >
      <View style={styles.watchlistHeader}>
        <View style={styles.watchlistInfo}>
          <Text style={[styles.watchlistName, { color: theme.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.stockCount, { color: theme.textSecondary }]}>
            {item.stocks.length} stock{item.stocks.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <View style={styles.watchlistActions}>
          <TouchableOpacity
            onPress={() => handleDeleteWatchlist(item.id, item.name)}
            style={styles.deleteButton}
          >
            <MaterialIcons name="delete-outline" size={20} color={theme.error} />
          </TouchableOpacity>
          <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
        </View>
      </View>

      {item.stocks.length > 0 && (
        <View style={styles.stockPreview}>
          {item.stocks.slice(0, 3).map((stock, index) => (
            <View key={stock.symbol} style={[styles.stockChip, { backgroundColor: theme.surface }]}>
              <Text style={[styles.stockSymbol, { color: theme.text }]}>
                {stock.symbol}
              </Text>
            </View>
          ))}
          {item.stocks.length > 3 && (
            <Text style={[styles.moreStocks, { color: theme.textSecondary }]}>
              +{item.stocks.length - 3} more
            </Text>
          )}
        </View>
      )}

      <Text style={[styles.createdDate, { color: theme.textSecondary }]}>
        Created {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (watchlists.length === 0) {
    return (
      <EmptyState
        icon="bookmark-border"
        message="No watchlists yet"
        subtitle="Create your first watchlist to track your favorite stocks and ETFs"
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          My Watchlists
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {watchlists.length} watchlist{watchlists.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={watchlists}
        renderItem={renderWatchlistItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 5,
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  watchlistCard: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    marginVertical: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  watchlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  watchlistInfo: {
    flex: 1,
  },
  watchlistName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stockCount: {
    fontSize: 14,
    marginTop: 5,
  },
  watchlistActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 5,
    marginRight: 10,
  },
  stockPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 15,
  },
  stockChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  stockSymbol: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreStocks: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  createdDate: {
    fontSize: 12,
  },
});

export default WatchlistScreen;
