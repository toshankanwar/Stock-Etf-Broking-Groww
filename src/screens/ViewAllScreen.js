import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const ViewAllScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { favorites } = useApp();
  const { data, title, type } = route.params;

  const [stocks, setStocks] = useState(Array.isArray(data) ? data : []);
  const [filteredStocks, setFilteredStocks] = useState(Array.isArray(data) ? data : []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rank'); // rank, price, change
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title });
    filterAndSortStocks();
  }, [navigation, title, searchQuery, sortBy, stocks]);

  const filterAndSortStocks = () => {
    let filtered = [...stocks];
    
    // Search filtering
    if (searchQuery) {
      filtered = filtered.filter(stock => 
        (stock.ticker || stock.symbol || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(b.price || 0) - parseFloat(a.price || 0);
        case 'change':
          const changeA = parseFloat((a.change_percentage || '0').replace('%', ''));
          const changeB = parseFloat((b.change_percentage || '0').replace('%', ''));
          return changeB - changeA;
        default: // rank
          return 0;
      }
    });
    
    setFilteredStocks(filtered);
  };

  const handleStockPress = (stock) => {
    navigation.navigate('StockDetails', { 
      symbol: stock.ticker || stock.symbol,
      stock 
    });
  };

  const formatPrice = (price) => parseFloat(price || 0).toFixed(2);
  const formatChange = (change) => {
    const value = parseFloat(change?.replace('%', '') || 0);
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  const formatVolume = (volume) => {
    const num = parseInt(volume || 0);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getChangeColor = (change) => {
    const value = parseFloat(change?.replace('%', '') || 0);
    return value >= 0 ? theme.gainColor : theme.lossColor;
  };

  const getPerformanceBadge = (index) => {
    if (index === 0) return { icon: 'emoji-events', color: '#FFD700', label: 'Top' };
    if (index < 3) return { icon: 'star', color: theme.primary, label: 'Hot' };
    if (index < 10) return { icon: 'trending-up', color: theme.gainColor, label: 'Rising' };
    return null;
  };

  const renderProfessionalStockItem = ({ item, index }) => {
    const changeValue = parseFloat(item.change_percentage?.replace('%', '') || 0);
    const isPositive = changeValue >= 0;
    const badge = getPerformanceBadge(index);
    const originalIndex = stocks.findIndex(stock => stock.symbol === item.symbol) + 1;

    return (
      <TouchableOpacity
        style={[styles.stockCard, { 
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          shadowColor: theme.shadowColor,
        }]}
        onPress={() => handleStockPress(item)}
        activeOpacity={0.7}
      >
        {/* Rank Badge */}
        <View style={[styles.rankBadge, { 
          backgroundColor: index < 3 ? theme.primary : theme.surface 
        }]}>
          <Text style={[styles.rankNumber, { 
            color: index < 3 ? '#FFFFFF' : theme.textSecondary 
          }]}>
            #{originalIndex}
          </Text>
        </View>

        {/* Performance Badge */}
        {badge && (
          <View style={[styles.performanceBadge, { backgroundColor: `${badge.color}15` }]}>
            <MaterialIcons name={badge.icon} size={12} color={badge.color} />
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        )}

        <View style={styles.stockContent}>
          {/* Header Section */}
          <View style={styles.stockHeader}>
            <View style={styles.symbolSection}>
              <Text style={[styles.stockSymbol, { color: theme.text }]}>
                {item.ticker || item.symbol}
              </Text>
              {favorites.has(item.ticker || item.symbol) && (
                <MaterialIcons name="bookmark" size={16} color={theme.primary} />
              )}
            </View>
            
            <View style={[styles.changeIndicator, {
              backgroundColor: isPositive ? `${theme.gainColor}15` : `${theme.lossColor}15`
            }]}>
              <MaterialIcons 
                name={isPositive ? "trending-up" : "trending-down"}
                size={14}
                color={getChangeColor(item.change_percentage)}
              />
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={[styles.currentPrice, { color: theme.text }]}>
              ${formatPrice(item.price)}
            </Text>
            <Text style={[styles.priceChange, { color: getChangeColor(item.change_percentage) }]}>
              {formatChange(item.change_percentage)}
            </Text>
          </View>

          {/* Metrics Section */}
          <View style={styles.metricsSection}>
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Vol</Text>
              <Text style={[styles.metricValue, { color: theme.textSecondary }]}>
                {formatVolume(item.volume)}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Trend</Text>
              <View style={styles.trendContainer}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.trendBar, {
                      backgroundColor: i < Math.abs(changeValue / 2) ? 
                        getChangeColor(item.change_percentage) : theme.border,
                      height: 4 + (i * 2),
                    }]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={[styles.actionButton, { borderColor: theme.border }]}>
          <MaterialIcons name="chevron-right" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.background }]}>
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {filteredStocks.length} of {stocks.length} stocks • Live data
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.searchButton, { 
            backgroundColor: showSearch ? theme.primary : theme.surface,
            borderColor: theme.border 
          }]}
          onPress={() => setShowSearch(!showSearch)}
        >
          <MaterialIcons 
            name="search" 
            size={20} 
            color={showSearch ? '#FFFFFF' : theme.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <MaterialIcons name="search" size={20} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search stocks..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        {[
          { key: 'rank', label: 'Rank', icon: 'format-list-numbered' },
          { key: 'price', label: 'Price', icon: 'attach-money' },
          { key: 'change', label: 'Change', icon: 'trending-up' },
        ].map((sort) => (
          <TouchableOpacity
            key={sort.key}
            style={[styles.sortButton, {
              backgroundColor: sortBy === sort.key ? theme.primary : theme.surface,
              borderColor: theme.border,
            }]}
            onPress={() => setSortBy(sort.key)}
          >
            <MaterialIcons 
              name={sort.icon} 
              size={16} 
              color={sortBy === sort.key ? '#FFFFFF' : theme.textSecondary} 
            />
            <Text style={[styles.sortText, {
              color: sortBy === sort.key ? '#FFFFFF' : theme.textSecondary
            }]}>
              {sort.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Market Summary */}
      <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.summaryItem}>
          <MaterialIcons name="trending-up" size={16} color={theme.gainColor} />
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Gainers</Text>
          <Text style={[styles.summaryValue, { color: theme.gainColor }]}>
            {stocks.filter(s => parseFloat(s.change_percentage?.replace('%', '') || 0) > 0).length}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <MaterialIcons name="trending-down" size={16} color={theme.lossColor} />
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Losers</Text>
          <Text style={[styles.summaryValue, { color: theme.lossColor }]}>
            {stocks.filter(s => parseFloat(s.change_percentage?.replace('%', '') || 0) < 0).length}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <MaterialIcons name="show-chart" size={16} color={theme.primary} />
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Active</Text>
          <Text style={[styles.summaryValue, { color: theme.primary }]}>
            {stocks.length}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading && filteredStocks.length === 0) {
    return <LoadingSpinner message={`Loading ${title.toLowerCase()}...`} />;
  }

  if (!Array.isArray(filteredStocks) || filteredStocks.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.statusBarBg, { backgroundColor: theme.background }]} />
        <EmptyState
          icon="search-off"
          message={searchQuery ? "No stocks found" : "No stocks available"}
          subtitle={searchQuery ? `No results for "${searchQuery}"` : "Please try again later"}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.statusBarBg, { backgroundColor: theme.background }]} />
      
      <FlatList
        data={filteredStocks}
        renderItem={renderProfessionalStockItem}
        keyExtractor={(item, index) => `${type}_${item.ticker || item.symbol}_${index}`}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 2000);
            }}
            colors={[theme.primary]}
            tintColor={theme.primary}
            progressBackgroundColor={theme.cardBackground}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        initialNumToRender={15}
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
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
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
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    padding: 0,
  },
  sortContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  summaryCard: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  stockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
    position: 'relative',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  rankBadge: {
    position: 'absolute',
    top: -6,
    left: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  performanceBadge: {
    position: 'absolute',
    top: -6,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  stockContent: {
    flex: 1,
    paddingTop: 8,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbolSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  changeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricsSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  trendBar: {
    width: 3,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});

export default ViewAllScreen;
