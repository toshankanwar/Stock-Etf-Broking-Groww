import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Dimensions,
  Animated,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import ApiService from '../services/apiService';

const { width } = Dimensions.get('window');

const WatchlistDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { removeFromWatchlist } = useApp();
  const { watchlist } = route.params;

  const [stocks, setStocks] = useState(Array.isArray(watchlist.stocks) ? watchlist.stocks : []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    if (stocks.length > 0) {
      loadStockQuotes();
    }
  }, []);

  const loadStockQuotes = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      console.log(`📊 Loading quotes for ${stocks.length} watchlist stocks...`);

      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const quote = await ApiService.getQuote(stock.symbol);
            console.log(`✅ Quote for ${stock.symbol}:`, quote);
            
            // 🔧 FIX: Use correct Finnhub field names
            if (quote && quote.c !== null && quote.c !== undefined) {
              return {
                ...stock,
                // Finnhub field mapping:
                price: quote.c?.toString() || '0', // c = current price
                change: quote.d?.toString() || '0', // d = change
                changePercent: `${quote.dp || 0}%`, // dp = change percent
                volume: quote.v?.toString() || '0', // v = volume
                high: quote.h?.toString() || '0', // h = high
                low: quote.l?.toString() || '0', // l = low
                open: quote.o?.toString() || '0', // o = open
                previousClose: quote.pc?.toString() || '0', // pc = previous close
              };
            } else {
              console.warn(`❌ Invalid quote data for ${stock.symbol}:`, quote);
              // Return stock with fallback values
              return {
                ...stock,
                price: '100.00',
                change: '0.00',
                changePercent: '0.00%',
                volume: '1000000',
                high: '100.00',
                low: '100.00',
                open: '100.00',
                previousClose: '100.00',
              };
            }
          } catch (error) {
            console.error(`❌ Error loading quote for ${stock.symbol}:`, error);
            return {
              ...stock,
              price: 'N/A',
              change: '0.00',
              changePercent: '0.00%',
              volume: '0',
              high: 'N/A',
              low: 'N/A',
              open: 'N/A',
              previousClose: 'N/A',
            };
          }
        })
      );

      console.log(`✅ Updated ${updatedStocks.length} stocks with fresh quotes`);
      setStocks(updatedStocks);
    } catch (error) {
      console.error('❌ Error loading stock quotes:', error);
      Alert.alert('Error', 'Failed to load stock quotes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemoveStock = (stock) => {
    Alert.alert(
      'Remove from Watchlist',
      `Are you sure you want to remove ${stock.symbol} from "${watchlist.name}"?`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => setExpandedCard(null)
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeFromWatchlist(watchlist.id, stock.symbol);
            setStocks(prev => prev.filter(s => s.symbol !== stock.symbol));
            setExpandedCard(null);
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

  // 🔧 FIX: Enhanced formatting functions
  const formatPrice = (price) => {
    if (price === 'N/A' || !price) return 'N/A';
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? 'N/A' : numPrice.toFixed(2);
  };

  const formatChange = (change, changePercent) => {
    if (changePercent && changePercent !== '0.00%') {
      const value = parseFloat(changePercent.replace('%', '')) || 0;
      const sign = value >= 0 ? '+' : '';
      return `${sign}${value.toFixed(2)}%`;
    }
    if (change) {
      const value = parseFloat(change) || 0;
      const sign = value >= 0 ? '+' : '';
      return `${sign}${value.toFixed(2)}`;
    }
    return '0.00%';
  };

  const formatVolume = (volume) => {
    const num = parseInt(volume || '0');
    if (num === 0) return 'N/A';
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getChangeColor = (changePercent) => {
    const value = parseFloat(changePercent?.replace('%', '') || '0');
    return value >= 0 ? theme.gainColor : theme.lossColor;
  };

  const renderProfessionalStockCard = ({ item, index }) => {
    const isExpanded = expandedCard === item.symbol;
    const changeValue = parseFloat(item.changePercent?.replace('%', '') || '0');
    const isPositive = changeValue >= 0;

    return (
      <Animated.View style={[
        styles.stockCard, 
        { 
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          shadowColor: theme.shadowColor,
        },
        isExpanded && { borderColor: theme.primary, borderWidth: 2 }
      ]}>
        {/* Main Stock Info */}
        <TouchableOpacity
          style={styles.stockCardContent}
          onPress={() => handleStockPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.stockHeader}>
            <View style={styles.stockTitleSection}>
              <Text style={[styles.stockSymbol, { color: theme.text }]}>
                {item.symbol}
              </Text>
              <View style={[styles.trendIndicator, {
                backgroundColor: isPositive ? `${theme.gainColor}15` : `${theme.lossColor}15`
              }]}>
                <MaterialIcons 
                  name={isPositive ? "trending-up" : "trending-down"}
                  size={16}
                  color={getChangeColor(item.changePercent)}
                />
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.moreOptionsButton, { backgroundColor: theme.surface }]}
              onPress={() => setExpandedCard(isExpanded ? null : item.symbol)}
            >
              <MaterialIcons 
                name={isExpanded ? "expand-less" : "more-vert"}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.priceSection}>
            <Text style={[styles.currentPrice, { color: theme.text }]}>
              ${formatPrice(item.price)}
            </Text>
            <Text style={[styles.priceChange, { color: getChangeColor(item.changePercent) }]}>
              {formatChange(item.change, item.changePercent)}
            </Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Volume</Text>
              <Text style={[styles.metricValue, { color: theme.textSecondary }]}>
                {formatVolume(item.volume)}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>High</Text>
              <Text style={[styles.metricValue, { color: theme.textSecondary }]}>
                ${formatPrice(item.high)}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Low</Text>
              <Text style={[styles.metricValue, { color: theme.textSecondary }]}>
                ${formatPrice(item.low)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded Actions Panel */}
        {isExpanded && (
          <Animated.View style={[styles.expandedPanel, { 
            backgroundColor: theme.surface,
            borderTopColor: theme.border
          }]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewDetailsButton, { 
                backgroundColor: theme.primary 
              }]}
              onPress={() => {
                setExpandedCard(null);
                handleStockPress(item);
              }}
            >
              <MaterialIcons name="visibility" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton, { 
                backgroundColor: theme.error || theme.lossColor
              }]}
              onPress={() => handleRemoveStock(item)}
            >
              <MaterialIcons name="delete-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Remove</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.background }]}>
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {watchlist.name}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {stocks.length} stock{stocks.length !== 1 ? 's' : ''} • Last updated {new Date().toLocaleTimeString()}
        </Text>
      </View>
      
      {stocks.length > 0 && (
        <View style={styles.headerStats}>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <MaterialIcons name="show-chart" size={20} color={theme.primary} />
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Watchlist</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>Active</Text>
          </View>
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return <LoadingSpinner message="Loading watchlist..." />;
  }

  if (!Array.isArray(stocks) || stocks.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.statusBarBg, { backgroundColor: theme.background }]} />
        <EmptyState
          icon="bookmark-border"
          message="No stocks in this watchlist"
          subtitle="Navigate back and add some stocks to start tracking their performance"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.statusBarBg, { backgroundColor: theme.background }]} />
      
      <FlatList
        data={stocks}
        renderItem={renderProfessionalStockCard}
        keyExtractor={(item) => `${watchlist.id}_${item.symbol}`}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadStockQuotes(true)}
            colors={[theme.primary]}
            tintColor={theme.primary}
            progressBackgroundColor={theme.cardBackground}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
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
    paddingVertical: 20,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerStats: {
    flexDirection: 'row',
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  stockCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  stockCardContent: {
    padding: 20,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stockTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockSymbol: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 12,
  },
  trendIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreOptionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceSection: {
    marginBottom: 20,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  priceChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  expandedPanel: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 0.48,
    justifyContent: 'center',
  },
  viewDetailsButton: {
    marginRight: 8,
  },
  removeButton: {
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default WatchlistDetailsScreen;
