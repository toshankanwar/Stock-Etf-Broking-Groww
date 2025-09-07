import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
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

  const [stock, setStock] = useState(initialStock || {});
  const [quote, setQuote] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [isRealChartData, setIsRealChartData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  useEffect(() => {
    loadStockData();
  }, [symbol]);

  // 🚀 Load REAL chart data from Finnhub
// Enhanced loadRealChartData function
const loadRealChartData = async () => {
  try {
    console.log(`📈 Loading real chart data for ${symbol}...`);
    
    const candlesResponse = await ApiService.getStockCandles(symbol, 'D', 7);
    
    if (candlesResponse.success && candlesResponse.data) {
      const { close, timestamps } = candlesResponse.data;
      
      if (close && close.length > 0) {
        const chartData = {
          labels: timestamps.map(timestamp => {
            const date = new Date(timestamp * 1000);
            return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
          }),
          datasets: [{
            data: close,
            color: (opacity = 1) => `rgba(0, 208, 156, ${opacity})`,
            strokeWidth: 2,
          }],
        };
        
        setChartData(chartData);
        setIsRealChartData(true);
        console.log(`✅ Real chart data loaded: ${close.length} price points`);
        return true;
      }
    }
    
    console.log(`ℹ️ ${candlesResponse.error || 'No real chart data available'}`);
    return false;
  } catch (error) {
    console.error('❌ Chart data loading failed:', error);
    return false;
  }
};


  // Fallback mock data generator
  const generateMockChartData = () => {
    console.log('📊 Generating mock chart data as fallback');
    const basePrice = parseFloat(quote?.c || stock?.price || 100);
    const days = 7;
    const prices = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = basePrice * (1 + variation - (i * 0.01)); // Slight downward trend
      prices.push(price);
    }

    const chartData = {
      labels: Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
      }),
      datasets: [{
        data: prices,
        color: (opacity = 1) => `rgba(0, 208, 156, ${opacity})`,
        strokeWidth: 2,
      }],
    };
    
    setChartData(chartData);
    setIsRealChartData(false);
  };

  const loadStockData = async () => {
    try {
      setLoading(true);
      
      console.log(`📊 Loading complete data for ${symbol}...`);
      
      // Load quote and company profile from Finnhub
      const [quoteResponse, companyResponse] = await Promise.allSettled([
        ApiService.getQuote(symbol),
        ApiService.getCompanyOverview(symbol),
      ]);

      // Process Finnhub quote data
      if (quoteResponse.status === 'fulfilled' && quoteResponse.value) {
        const quoteData = quoteResponse.value;
        console.log('✅ Quote data received:', quoteData);
        
        setQuote(quoteData);
        
        // Update stock info with Finnhub quote data
        setStock(prev => ({
          ...prev,
          symbol: symbol,
          price: quoteData.c?.toString() || prev.price || '0',
          change: quoteData.d?.toString() || '0',
          changePercent: `${quoteData.dp || 0}%`,
          volume: quoteData.v?.toString() || '0',
          high: quoteData.h?.toString() || '0',
          low: quoteData.l?.toString() || '0',
          open: quoteData.o?.toString() || '0',
          previousClose: quoteData.pc?.toString() || '0',
        }));
      }

      // Process Finnhub company data
      if (companyResponse.status === 'fulfilled' && companyResponse.value) {
        const companyData = companyResponse.value;
        console.log('✅ Company data received:', companyData);
        setCompanyInfo(companyData);
      }

      // 🚀 Try to load REAL chart data first, fallback to mock if needed
      const realDataLoaded = await loadRealChartData();
      if (!realDataLoaded) {
        generateMockChartData();
      }

    } catch (error) {
      console.error('❌ Error loading stock data:', error);
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

  const formatVolume = (volume) => {
    const num = parseInt(volume || 0);
    if (num === 0) return 'N/A';
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatMarketCap = (marketCap) => {
    if (!marketCap || marketCap === null || marketCap === 0) {
      // Calculate estimated market cap if not provided
      const price = parseFloat(quote?.c || stock?.price || 0);
      if (price > 0) {
        // Estimate based on typical share counts for different price ranges
        let estimatedShares;
        if (price > 1000) estimatedShares = 1000000000; // 1B shares for high-price stocks like BRK.A
        else if (price > 500) estimatedShares = 2000000000; // 2B shares for expensive stocks
        else if (price > 100) estimatedShares = 5000000000; // 5B shares for mid-price stocks
        else if (price > 50) estimatedShares = 8000000000; // 8B shares for moderate-price stocks
        else estimatedShares = 10000000000; // 10B shares for low-price stocks
        
        const estimatedMarketCap = price * estimatedShares;
        return formatMarketCapValue(estimatedMarketCap) + '*';
      }
      return 'N/A';
    }
    return formatMarketCapValue(marketCap);
  };

  const formatMarketCapValue = (value) => {
    const num = parseInt(value);
    if (num >= 1000000000000) return `$${(num / 1000000000000).toFixed(1)}T`;
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    return `$${num.toLocaleString()}`;
  };

  const getChangeColor = () => {
    const change = parseFloat(quote?.d || stock?.change || 0);
    return change >= 0 ? theme.gainColor : theme.lossColor;
  };

  const getCompanyDescription = () => {
    if (companyInfo?.Description && companyInfo.Description.trim().length > 20) {
      return companyInfo.Description;
    }
    
    // Generate professional description with actual company context
    const companyName = companyInfo?.Name || stock?.name || symbol;
    const marketCap = formatMarketCap(companyInfo?.MarketCapitalization);
    const price = formatPrice(quote?.c || stock?.price);
    
    return `${companyName} (${symbol}) is a publicly traded company with a current market value of ${marketCap}. The stock is currently trading at $${price} per share. The company operates across various business segments and provides products and services to customers worldwide. ${companyName} is listed on major stock exchanges and is actively traded by institutional and retail investors. For detailed financial information, business operations, and latest earnings reports, please refer to the company's official SEC filings and investor relations materials.`;
  };

  const getMarketStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Market hours: Monday-Friday, 9:30 AM - 4:00 PM ET
    const isWeekday = currentDay >= 1 && currentDay <= 5;
    const isMarketHours = currentHour >= 9 && currentHour < 16;
    
    if (!isWeekday) return 'Closed (Weekend)';
    if (!isMarketHours) return currentHour < 9 ? 'Pre-Market' : 'After Hours';
    return 'Market Open';
  };

  const isInWatchlist = favorites.has(symbol);

  if (loading) {
    return <LoadingSpinner message="Loading stock details..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.statusBarBg, { backgroundColor: theme.background }]} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.headerInfo}>
            <View style={styles.symbolRow}>
              <Text style={[styles.symbol, { color: theme.text }]}>
                {symbol}
              </Text>
              <View style={[styles.trendIndicator, {
                backgroundColor: getChangeColor() === theme.gainColor ? 
                  `${theme.gainColor}15` : `${theme.lossColor}15`
              }]}>
                <MaterialIcons 
                  name={getChangeColor() === theme.gainColor ? "trending-up" : "trending-down"}
                  size={16}
                  color={getChangeColor()}
                />
              </View>
            </View>
            <Text style={[styles.companyName, { color: theme.textSecondary }]} numberOfLines={2}>
              {companyInfo?.Name || stock?.name || 'Loading company name...'}
            </Text>
            <Text style={[styles.lastUpdate, { color: theme.textMuted }]}>
              Last updated: {new Date().toLocaleTimeString()} • {getMarketStatus()}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.watchlistButton, { 
              backgroundColor: isInWatchlist ? theme.primary : 'transparent',
              borderColor: theme.primary 
            }]}
            onPress={() => setShowWatchlistModal(true)}
          >
            <MaterialIcons 
              name={isInWatchlist ? "bookmark" : "bookmark-border"} 
              size={20} 
              color={isInWatchlist ? '#FFFFFF' : theme.primary} 
            />
            <Text style={[styles.watchlistText, { 
              color: isInWatchlist ? '#FFFFFF' : theme.primary 
            }]}>
              {isInWatchlist ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Price Section */}
        <View style={[styles.priceSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.priceRow}>
            <Text style={[styles.currentPrice, { color: theme.text }]}>
              ${formatPrice(quote?.c || stock?.price)}
            </Text>
            <Text style={[styles.priceChange, { color: getChangeColor() }]}>
              {formatChange(
                quote?.d || stock?.change,
                quote?.dp ? `${quote.dp}%` : stock?.changePercent
              )}
            </Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Open</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                ${formatPrice(quote?.o || stock?.open)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>High</Text>
              <Text style={[styles.statValue, { color: theme.gainColor }]}>
                ${formatPrice(quote?.h || stock?.high)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Low</Text>
              <Text style={[styles.statValue, { color: theme.lossColor }]}>
                ${formatPrice(quote?.l || stock?.low)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Prev Close</Text>
              <Text style={[styles.statValue, { color: theme.textSecondary }]}>
                ${formatPrice(quote?.pc || stock?.previousClose)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Volume</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {formatVolume(quote?.v || stock?.volume)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Market Cap</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {formatMarketCap(companyInfo?.MarketCapitalization)}
              </Text>
            </View>
          </View>
        </View>

        {/* Chart Section */}
        <View style={[styles.chartSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>Price Chart (7 Days)</Text>
            <Text style={[styles.chartSubtitle, { color: theme.textMuted }]}>
              {isRealChartData ? 'Real Market Data' : 'Demo Data'}
            </Text>
          </View>
          
          {chartData ? (
            <StockChart data={chartData} symbol={symbol} />
          ) : (
            <View style={styles.chartPlaceholder}>
              <MaterialIcons name="show-chart" size={48} color={theme.textSecondary} />
              <Text style={[styles.chartPlaceholderText, { color: theme.textSecondary }]}>
                Chart data loading...
              </Text>
            </View>
          )}
        </View>

        {/* Company Info Section */}
        <View style={[styles.infoSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Company Overview</Text>
          
          <View style={styles.infoGrid}>
            <InfoItem
              label="P/E Ratio"
              value={companyInfo?.PERatio ? parseFloat(companyInfo.PERatio).toFixed(2) : 'N/A'}
              theme={theme}
            />
            <InfoItem
              label="52W High"
              value={companyInfo?.['52WeekHigh'] ? `$${parseFloat(companyInfo['52WeekHigh']).toFixed(2)}` : `$${formatPrice(quote?.h || stock?.high)}`}
              theme={theme}
            />
            <InfoItem
              label="52W Low"
              value={companyInfo?.['52WeekLow'] ? `$${parseFloat(companyInfo['52WeekLow']).toFixed(2)}` : `$${formatPrice(quote?.l || stock?.low)}`}
              theme={theme}
            />
            <InfoItem
              label="Beta"
              value={companyInfo?.Beta ? parseFloat(companyInfo.Beta).toFixed(2) : '1.00'}
              theme={theme}
            />
            <InfoItem
              label="Daily Volume"
              value={formatVolume(quote?.v || stock?.volume)}
              theme={theme}
            />
            <InfoItem
              label="Shares Outstanding"
              value={companyInfo?.MarketCapitalization && quote?.c ? 
                formatVolume((companyInfo.MarketCapitalization / quote.c)) : 
                'N/A'
              }
              theme={theme}
            />
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={[styles.descriptionTitle, { color: theme.text }]}>About {companyInfo?.Name || symbol}</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {getCompanyDescription().length > 500 ? 
                `${getCompanyDescription().slice(0, 500)}...` :
                getCompanyDescription()
              }
            </Text>
            {formatMarketCap(companyInfo?.MarketCapitalization).includes('*') && (
              <Text style={[styles.estimateNote, { color: theme.textMuted }]}>
                * Market cap is estimated based on current price and typical share count
              </Text>
            )}
          </View>
        </View>

        {/* Trading Information */}
        <View style={[styles.tradingSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Market Information</Text>
          
          <View style={styles.tradingGrid}>
            <View style={[styles.tradingCard, { backgroundColor: theme.surface }]}>
              <MaterialIcons name="schedule" size={20} color={theme.primary} />
              <Text style={[styles.tradingCardTitle, { color: theme.text }]}>Market Status</Text>
              <Text style={[styles.tradingCardValue, { color: theme.textSecondary }]}>
                {getMarketStatus()}
              </Text>
            </View>
            
            <View style={[styles.tradingCard, { backgroundColor: theme.surface }]}>
              <MaterialIcons name="trending-up" size={20} color={theme.gainColor} />
              <Text style={[styles.tradingCardTitle, { color: theme.text }]}>Day Range</Text>
              <Text style={[styles.tradingCardValue, { color: theme.textSecondary }]}>
                ${formatPrice(quote?.l || stock?.low)} - ${formatPrice(quote?.h || stock?.high)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Watchlist Modal */}
      <WatchlistModal
        isVisible={showWatchlistModal}
        onClose={() => setShowWatchlistModal(false)}
        stock={{ symbol, name: companyInfo?.Name || stock?.name || symbol }}
      />
    </SafeAreaView>
  );
};

const InfoItem = ({ label, value, theme }) => (
  <View style={styles.infoItem}>
    <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarBg: {
    height: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderWidth: 1,
    margin: 15,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  headerInfo: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  symbol: {
    fontSize: 28,
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
  companyName: {
    fontSize: 16,
    marginBottom: 4,
  },
  lastUpdate: {
    fontSize: 12,
  },
  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  watchlistText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  priceSection: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
    margin: 15,
    marginTop: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  currentPrice: {
    fontSize: 36,
    fontWeight: '700',
  },
  priceChange: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '32%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartSection: {
    borderWidth: 1,
    borderRadius: 16,
    margin: 15,
    marginTop: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  chartHeader: {
    padding: 20,
    paddingBottom: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  chartSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  chartPlaceholder: {
    height: 220,
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
    borderRadius: 16,
    margin: 15,
    marginTop: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  estimateNote: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  tradingSection: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
    margin: 15,
    marginTop: 5,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tradingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tradingCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  tradingCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  tradingCardValue: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default StockDetailsScreen;
