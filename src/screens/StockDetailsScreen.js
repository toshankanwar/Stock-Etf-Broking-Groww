import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import StockChart from '../components/StockChart';
import WatchlistModal from '../components/WatchlistModal';
import LoadingSpinner from '../components/LoadingSpinner';

import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import ApiService from '../services/apiService';

const StockDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { favorites } = useApp();
  const { symbol, stock: initialStock } = route.params;

  const [stock, setStock] = useState(initialStock);
  const [quote, setQuote] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  useEffect(() => {
    loadStockData();
  }, [symbol]);

  const loadStockData = async () => {
    try {
      setLoading(true);
      
      // Load multiple data sources in parallel
      const [quoteResponse, companyResponse, timeSeriesResponse] = await Promise.allSettled([
        ApiService.getQuote(symbol),
        ApiService.getCompanyOverview(symbol),
        ApiService.getTimeSeriesDaily(symbol),
      ]);

      // Process quote data
      if (quoteResponse.status === 'fulfilled' && quoteResponse.value['Global Quote']) {
        const quoteData = quoteResponse.value['Global Quote'];
        setQuote(quoteData);
        
        // Update stock info with quote data
        setStock(prev => ({
          ...prev,
          price: quoteData['05. price'],
          change: quoteData['09. change'],
          changePercent: quoteData['10. change percent'],
          volume: quoteData['06. volume'],
        }));
      }

      // Process company overview
      if (companyResponse.status === 'fulfilled') {
        setCompanyInfo(companyResponse.value);
      }

      // Process time series for chart
      if (timeSeriesResponse.status === 'fulfilled' && timeSeriesResponse.value['Time Series (Daily)']) {
        const timeSeries = timeSeriesResponse.value['Time Series (Daily)'];
        const dates = Object.keys(timeSeries).slice(0, 7).reverse();
        
        const chartData = {
          labels: dates.map(date => date.slice(5)), // MM-DD format
          datasets: [{
            data: dates.map(date => parseFloat(timeSeries[date]['4. close'])),
            color: (opacity = 1) => `rgba(0, 208, 156, ${opacity})`,
            strokeWidth: 2,
          }],
        };
        
        setChartData(chartData);
      }
    } catch (error) {
      console.error('Error loading stock data:', error);
      Alert.alert('Error', 'Failed to load stock details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return parseFloat(price || 0).toFixed(2);
  };

  const formatChange = (change, changePercent) => {
    const changeValue = parseFloat(change || 0);
    const percentValue = parseFloat(changePercent?.replace('%', '') || 0);
    const sign = changeValue >= 0 ? '+' : '';
    return `${sign}${changeValue.toFixed(2)} (${sign}${percentValue.toFixed(2)}%)`;
  };

  const getChangeColor = () => {
    const change = parseFloat(quote?.['09. change'] || stock?.change || 0);
    return change >= 0 ? theme.gainColor : theme.lossColor;
  };

  const isInWatchlist = favorites.has(symbol);

  if (loading) {
    return <LoadingSpinner message="Loading stock details..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.headerInfo}>
            <Text style={[styles.symbol, { color: theme.text }]}>
              {symbol}
            </Text>
            <Text style={[styles.companyName, { color: theme.textSecondary }]} numberOfLines={2}>
              {companyInfo?.Name || stock?.name || 'Company Name'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.watchlistButton, { borderColor: theme.primary }]}
            onPress={() => setShowWatchlistModal(true)}
          >
            <MaterialIcons 
              name={isInWatchlist ? "bookmark" : "bookmark-border"} 
              size={24} 
              color={theme.primary} 
            />
            <Text style={[styles.watchlistText, { color: theme.primary }]}>
              {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Price Section */}
        <View style={[styles.priceSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.priceRow}>
            <Text style={[styles.currentPrice, { color: theme.text }]}>
              ${formatPrice(quote?.['05. price'] || stock?.price)}
            </Text>
            <Text style={[styles.priceChange, { color: getChangeColor() }]}>
              {formatChange(
                quote?.['09. change'] || stock?.change,
                quote?.['10. change percent'] || stock?.changePercent
              )}
            </Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Volume</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {parseInt(quote?.['06. volume'] || stock?.volume || 0).toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>High</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                ${formatPrice(quote?.['03. high'])}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Low</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                ${formatPrice(quote?.['04. low'])}
              </Text>
            </View>
          </View>
        </View>

        {/* Chart Section */}
        <View style={[styles.chartSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          {chartData ? (
            <StockChart data={chartData} symbol={symbol} />
          ) : (
            <View style={styles.chartPlaceholder}>
              <MaterialIcons name="show-chart" size={48} color={theme.textSecondary} />
              <Text style={[styles.chartPlaceholderText, { color: theme.textSecondary }]}>
                Chart data unavailable
              </Text>
            </View>
          )}
        </View>

        {/* Company Info Section */}
        {companyInfo && (
          <View style={[styles.infoSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Company Overview</Text>
            
            <View style={styles.infoGrid}>
              <InfoItem
                label="Market Cap"
                value={companyInfo.MarketCapitalization ? `$${parseInt(companyInfo.MarketCapitalization).toLocaleString()}` : 'N/A'}
                theme={theme}
              />
              <InfoItem
                label="P/E Ratio"
                value={companyInfo.PERatio || 'N/A'}
                theme={theme}
              />
              <InfoItem
                label="52W High"
                value={companyInfo['52WeekHigh'] ? `$${companyInfo['52WeekHigh']}` : 'N/A'}
                theme={theme}
              />
              <InfoItem
                label="52W Low"
                value={companyInfo['52WeekLow'] ? `$${companyInfo['52WeekLow']}` : 'N/A'}
                theme={theme}
              />
              <InfoItem
                label="Dividend Yield"
                value={companyInfo.DividendYield ? `${(companyInfo.DividendYield * 100).toFixed(2)}%` : 'N/A'}
                theme={theme}
              />
              <InfoItem
                label="Beta"
                value={companyInfo.Beta || 'N/A'}
                theme={theme}
              />
            </View>

            {companyInfo.Description && (
              <View style={styles.descriptionContainer}>
                <Text style={[styles.descriptionTitle, { color: theme.text }]}>Description</Text>
                <Text style={[styles.description, { color: theme.textSecondary }]}>
                  {companyInfo.Description.slice(0, 300)}...
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Watchlist Modal */}
      <WatchlistModal
        isVisible={showWatchlistModal}
        onClose={() => setShowWatchlistModal(false)}
        stock={{ symbol, name: companyInfo?.Name || stock?.name }}
      />
    </View>
  );
};

const InfoItem = ({ label, value, theme }) => (
  <View style={styles.infoItem}>
    <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    margin: 15,
    borderRadius: 15,
  },
  headerInfo: {
    flex: 1,
  },
  symbol: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: 16,
    marginTop: 5,
  },
  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  watchlistText: {
    marginLeft: 5,
    fontWeight: '600',
  },
  priceSection: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 15,
    margin: 15,
    marginTop: 5,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  priceChange: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartSection: {
    borderWidth: 1,
    borderRadius: 15,
    margin: 15,
    marginTop: 5,
  },
  chartPlaceholder: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    marginTop: 10,
    fontSize: 16,
  },
  infoSection: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 15,
    margin: 15,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default StockDetailsScreen;
