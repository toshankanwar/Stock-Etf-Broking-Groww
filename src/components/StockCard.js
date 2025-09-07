import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';

const StockCard = ({ stock, onPress, showWatchlistIcon = false, isInWatchlist = false }) => {
  const { theme } = useTheme();

  const getChangeColor = () => {
    const change = parseFloat(stock.change_percentage?.replace('%', '') || stock.changePercent || 0);
    return change >= 0 ? theme.gainColor : theme.lossColor;
  };

  const formatPrice = (price) => {
    return parseFloat(price || 0).toFixed(2);
  };

  const formatChange = (change) => {
    const value = parseFloat(change?.replace('%', '') || 0);
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text style={[styles.symbol, { color: theme.text }]}>
            {stock.ticker || stock.symbol}
          </Text>
          {showWatchlistIcon && (
            <Icon 
              name={isInWatchlist ? "bookmark" : "bookmark-border"} 
              size={18} 
              color={isInWatchlist ? theme.primary : theme.textSecondary}
              style={styles.bookmarkIcon}
            />
          )}
        </View>
        <Text style={[styles.price, { color: theme.text }]}>
          ${formatPrice(stock.price)}
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.change, { color: getChangeColor() }]}>
          {formatChange(stock.change_percentage || stock.changePercent)}
        </Text>
        <Text style={[styles.volume, { color: theme.textSecondary }]}>
          Vol: {stock.volume ? parseInt(stock.volume).toLocaleString() : 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 8,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookmarkIcon: {
    marginLeft: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
  volume: {
    fontSize: 12,
  },
});

export default StockCard;
