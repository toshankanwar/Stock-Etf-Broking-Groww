import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

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

  const formatVolume = (volume) => {
    const num = parseInt(volume || 0);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const isPositive = parseFloat(stock.change_percentage?.replace('%', '') || 0) >= 0;

  return (
    <TouchableOpacity
      style={[styles.card, { 
        backgroundColor: theme.cardBackground, 
        borderColor: theme.border,
        shadowColor: theme.shadowColor,
      }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text style={[styles.symbol, { color: theme.text }]}>
            {stock.ticker || stock.symbol}
          </Text>
          {showWatchlistIcon && (
            <MaterialIcons 
              name={isInWatchlist ? "bookmark" : "bookmark-border"} 
              size={16} 
              color={isInWatchlist ? theme.primary : theme.textMuted}
            />
          )}
        </View>
        <View style={[styles.changeIndicator, { 
          backgroundColor: isPositive ? 
            `${theme.gainColor}15` : 
            `${theme.lossColor}15` 
        }]}>
          <MaterialIcons 
            name={isPositive ? "trending-up" : "trending-down"} 
            size={14} 
            color={getChangeColor()}
          />
        </View>
      </View>

      {/* Price */}
      <Text style={[styles.price, { color: theme.text }]}>
        ${formatPrice(stock.price)}
      </Text>

      {/* Change */}
      <Text style={[styles.change, { color: getChangeColor() }]}>
        {formatChange(stock.change_percentage || stock.changePercent)}
      </Text>

      {/* Volume */}
      <View style={styles.footer}>
        <Text style={[styles.volume, { color: theme.textMuted }]}>
          Vol {formatVolume(stock.volume)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  changeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  volume: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default StockCard;
