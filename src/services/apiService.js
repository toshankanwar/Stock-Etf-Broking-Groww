import { Alert } from 'react-native';
import { getCachedData, setCachedData } from './cacheService';

const FINNHUB_API_KEY = 'd2utd59r01qq994h7glgd2utd59r01qq994h7gm0';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

class ApiService {
  constructor() {
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }

  async makeFinnhubRequest(endpoint, params = {}, cacheKey, cacheExpiry = 300000) {
    try {
      if (cacheKey) {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) return cachedData;
      }

      const url = new URL(FINNHUB_BASE_URL + endpoint);
      params.token = FINNHUB_API_KEY;
      Object.entries(params).forEach(([key, value]) => 
        url.searchParams.append(key, value)
      );

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON but received ${contentType}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Finnhub Error: ${data.error}`);
      }

      if (cacheKey) {
        await setCachedData(cacheKey, data, cacheExpiry);
      }

      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error.message);
      throw error;
    }
  }

  // 🚀 SUPER FAST: Parallel batch processing
  async getBatchQuotes(symbols) {
    const results = {};
    const batchSize = 12; // Larger batches for speed
    
    console.log(`⚡ Fetching ${symbols.length} quotes in parallel batches...`);
    
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      
      // Process entire batch in parallel - NO sequential delays
      const batchPromises = batch.map(async (symbol) => {
        try {
          const data = await this.makeFinnhubRequest('/quote', 
            { symbol: symbol.toUpperCase() }, 
            `quote_${symbol.toUpperCase()}`, 
            120000 // 2 min aggressive cache
          );
          return { symbol, data };
        } catch (error) {
          // Return fallback data immediately instead of failing
          return { 
            symbol, 
            data: { c: 100, d: 0, dp: 0, h: 100, l: 100, o: 100, pc: 100, v: 1000000 } 
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ symbol, data }) => {
        results[symbol] = data;
      });

      // Minimal delay only if more batches remain
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 200)); // Reduced to 200ms
      }
    }

    return results;
  }

  // 🚀 LIGHTNING FAST: Optimized for speed
  async getTopGainersLosers() {
    try {
      console.log('⚡ SPEED MODE: Ultra-fast market data loading...');
      const startTime = Date.now();

      // Smaller, high-quality stock list for maximum speed
      const speedStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'META', 'AMZN', 'NFLX'];
      
      // Get all quotes in parallel - NO sequential processing
      const quotes = await this.getBatchQuotes(speedStocks);
      
      // Transform data quickly
      const stockData = speedStocks.map(symbol => {
        const quote = quotes[symbol];
        if (quote && quote.c !== null) {
          return {
            ticker: symbol,
            symbol: symbol,
            price: quote.c?.toFixed(2) || '0',
            change: quote.d?.toFixed(2) || '0',
            change_percentage: `${(quote.dp || 0).toFixed(2)}%`,
            volume: this.formatVolume(quote.v || 0),
            name: symbol,
            changePercent: quote.dp || 0,
          };
        }
        return null;
      }).filter(Boolean);

      // Quick sort and filter
      const sortedStocks = stockData.sort((a, b) => b.changePercent - a.changePercent);
      const gainers = sortedStocks.filter(stock => stock.changePercent > 0);
      const losers = sortedStocks.filter(stock => stock.changePercent < 0).reverse();

      const endTime = Date.now();
      console.log(`⚡ SPEED MODE completed in ${endTime - startTime}ms`);

      return {
        top_gainers: gainers,
        top_losers: losers
      };
    } catch (error) {
      console.error('❌ Speed mode failed:', error);
      return this.getEmergencyFallback();
    }
  }

  // 🚀 INSTANT LOADING: Cache-first strategy
  async getInstantMarketData() {
    try {
      console.log('⚡ INSTANT: Checking cache for immediate display...');
      
      // 1. Try to get cached data FIRST for instant display
      const [cachedGainers, cachedLosers] = await Promise.all([
        getCachedData('instant_gainers'),
        getCachedData('instant_losers')
      ]);

      let instantData = null;
      if (cachedGainers && cachedLosers) {
        console.log('⚡ INSTANT: Displaying cached data (0ms load time)');
        instantData = {
          top_gainers: cachedGainers,
          top_losers: cachedLosers,
          fromCache: true
        };
        
        // Start background refresh but don't wait for it
        setTimeout(() => this.refreshMarketDataBackground(), 100);
        
        return instantData;
      }

      // 2. No cache available - fetch fresh data
      console.log('⚡ No cache found, fetching fresh data...');
      return await this.getFreshMarketData();
      
    } catch (error) {
      console.error('❌ Instant data failed:', error);
      return { top_gainers: [], top_losers: [] };
    }
  }

  // Background refresh (non-blocking)
  async refreshMarketDataBackground() {
    try {
      console.log('🔄 Background refresh started...');
      const freshData = await this.getTopGainersLosers();
      
      // Cache the fresh data for next time
      await Promise.all([
        setCachedData('instant_gainers', freshData.top_gainers, 180000), // 3 min cache
        setCachedData('instant_losers', freshData.top_losers, 180000)
      ]);
      
      console.log('✅ Background refresh completed');
    } catch (error) {
      console.error('❌ Background refresh failed:', error);
    }
  }

  // Fresh data fetch with caching
  async getFreshMarketData() {
    const freshData = await this.getTopGainersLosers();
    
    // Cache for instant future access
    await Promise.all([
      setCachedData('instant_gainers', freshData.top_gainers, 180000),
      setCachedData('instant_losers', freshData.top_losers, 180000)
    ]);

    return freshData;
  }

  // Emergency fallback (minimal stocks)
  async getEmergencyFallback() {
    console.log('🆘 Emergency fallback - core stocks only');
    const coreStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
    
    const promises = coreStocks.map(async (symbol) => {
      try {
        const quote = await this.makeFinnhubRequest('/quote', { symbol }, null, 0);
        return quote ? {
          ticker: symbol, symbol, name: symbol,
          price: (quote.c || 100).toFixed(2),
          change: (quote.d || 0).toFixed(2),
          change_percentage: `${(quote.dp || 0).toFixed(2)}%`,
          volume: this.formatVolume(quote.v || 1000000),
          changePercent: quote.dp || 0,
        } : null;
      } catch {
        return null;
      }
    });

    const results = (await Promise.all(promises)).filter(Boolean);
    const sorted = results.sort((a, b) => b.changePercent - a.changePercent);
    
    return {
      top_gainers: sorted.filter(s => s.changePercent > 0),
      top_losers: sorted.filter(s => s.changePercent < 0).reverse()
    };
  }

  // Helper method
  formatVolume(volume) {
    const num = parseInt(volume || 0);
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  // 🚀 OPTIMIZED: Individual methods with fast caching
  async getQuote(symbol) {
    try {
      return await this.makeFinnhubRequest('/quote', 
        { symbol: symbol.toUpperCase() }, 
        `quote_${symbol.toUpperCase()}`, 
        120000 // 2 min cache
      );
    } catch (error) {
      return { c: 100, d: 0, dp: 0, h: 100, l: 100, o: 100, pc: 100, v: 1000000 };
    }
  }

  async getProfile(symbol) {
    try {
      return await this.makeFinnhubRequest('/stock/profile2', 
        { symbol: symbol.toUpperCase() }, 
        `profile_${symbol.toUpperCase()}`, 
        1800000 // 30 min cache
      );
    } catch (error) {
      return { name: symbol, marketCapitalization: null, shareOutstanding: null };
    }
  }

  async getCompanyOverview(symbol) {
    try {
      const [profile, quote] = await Promise.all([
        this.getProfile(symbol),
        this.getQuote(symbol)
      ]);

      return {
        Name: profile?.name || symbol, Symbol: symbol,
        Description: profile?.shareOutstanding ? `Shares Outstanding: ${profile.shareOutstanding}` : '',
        MarketCapitalization: profile?.marketCapitalization || null,
        PERatio: profile?.peAnnual || null, '52WeekHigh': quote?.h || null,
        '52WeekLow': quote?.l || null, Beta: profile?.beta || null,
      };
    } catch (error) {
      return {
        Name: symbol, Symbol: symbol, Description: '', MarketCapitalization: null,
        PERatio: null, '52WeekHigh': null, '52WeekLow': null, Beta: null,
      };
    }
  }

  async searchSymbol(query) {
    try {
      const data = await this.makeFinnhubRequest('/search', { q: query }, `search_${query}`, 1800000);
      return {
        bestMatches: data.result?.slice(0, 5).map(item => ({
          '1. symbol': item.symbol, '2. name': item.description, '3. type': item.type,
        })) || []
      };
    } catch (error) {
      return { bestMatches: [] };
    }
  }

  async getStockCandles(symbol, resolution = 'D', days = 7) {
    try {
      const validResolutions = ['1', '5', '15', '30', '60', 'D', 'W', 'M'];
      if (!validResolutions.includes(resolution)) resolution = 'D';

      const to = Math.floor(Date.now() / 1000);
      const from = to - (days * 24 * 60 * 60);
      
      const data = await this.makeFinnhubRequest('/stock/candles', {
        symbol: symbol.toUpperCase(), resolution, from, to
      }, `candles_${symbol.toUpperCase()}_${resolution}_${days}d`, 900000);

      if (data && data.s === 'ok' && data.c && data.c.length > 0) {
        return {
          success: true,
          data: { close: data.c, open: data.o, high: data.h, low: data.l, volume: data.v, timestamps: data.t }
        };
      }
      
      return { success: false, error: 'No data available' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTimeSeriesDaily(symbol) {
    return { 'Time Series (Daily)': {} };
  }
}

export default new ApiService();
