import { Alert } from 'react-native';
import { getCachedData, setCachedData } from './cacheService';

const API_KEY = 'YOUR_ALPHAVANTAGE_API_KEY'; // Replace with your actual API key
const BASE_URL = 'https://www.alphavantage.co/query';

class ApiService {
  constructor() {
    this.requestCount = 0;
    this.lastRequestTime = Date.now();
  }

  async makeRequest(params, cacheKey, cacheExpiry = 300000) { // 5 minutes default
    try {
      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Rate limiting (Alpha Vantage: 5 requests per minute, 500 per day)
      const now = Date.now();
      if (now - this.lastRequestTime < 12000) { // 12 seconds between requests
        await this.delay(12000 - (now - this.lastRequestTime));
      }

      const url = `${BASE_URL}?${new URLSearchParams({ ...params, apikey: API_KEY })}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data['Error Message'] || data['Note']) {
        throw new Error(data['Error Message'] || 'API limit reached. Please try again later.');
      }

      // Cache the response
      await setCachedData(cacheKey, data, cacheExpiry);
      
      this.lastRequestTime = Date.now();
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      Alert.alert('Error', error.message);
      throw error;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getTopGainersLosers() {
    return this.makeRequest(
      { function: 'TOP_GAINERS_LOSERS' },
      'top_gainers_losers',
      600000 // 10 minutes cache
    );
  }

  async getCompanyOverview(symbol) {
    return this.makeRequest(
      { function: 'OVERVIEW', symbol },
      `company_overview_${symbol}`,
      3600000 // 1 hour cache
    );
  }

  async getTimeSeriesDaily(symbol) {
    return this.makeRequest(
      { function: 'TIME_SERIES_DAILY', symbol },
      `time_series_${symbol}`,
      900000 // 15 minutes cache
    );
  }

  async searchSymbol(keywords) {
    return this.makeRequest(
      { function: 'SYMBOL_SEARCH', keywords },
      `search_${keywords}`,
      3600000 // 1 hour cache
    );
  }

  async getQuote(symbol) {
    return this.makeRequest(
      { function: 'GLOBAL_QUOTE', symbol },
      `quote_${symbol}`,
      60000 // 1 minute cache
    );
  }
}

export default new ApiService();
