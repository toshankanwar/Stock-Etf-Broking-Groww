import { Alert } from 'react-native';
import { ERROR_MESSAGES } from './constants';

/**
 * Format price with proper decimal places and currency symbol
 * @param {string|number} price - The price to format
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} Formatted price
 */
export const formatPrice = (price, currency = '$') => {
  const numPrice = parseFloat(price || 0);
  return `${currency}${numPrice.toFixed(2)}`;
};

/**
 * Format percentage change with proper sign and color coding
 * @param {string|number} change - The change percentage
 * @returns {string} Formatted change percentage
 */
export const formatPercentageChange = (change) => {
  const numChange = parseFloat(change?.toString().replace('%', '') || 0);
  const sign = numChange >= 0 ? '+' : '';
  return `${sign}${numChange.toFixed(2)}%`;
};

/**
 * Format volume numbers with K, M, B suffixes
 * @param {string|number} volume - The volume to format
 * @returns {string} Formatted volume
 */
export const formatVolume = (volume) => {
  const numVolume = parseInt(volume || 0);
  
  if (numVolume === 0) return 'N/A';
  
  if (numVolume >= 1000000000) {
    return `${(numVolume / 1000000000).toFixed(1)}B`;
  } else if (numVolume >= 1000000) {
    return `${(numVolume / 1000000).toFixed(1)}M`;
  } else if (numVolume >= 1000) {
    return `${(numVolume / 1000).toFixed(1)}K`;
  }
  
  return numVolume.toLocaleString();
};

/**
 * Format market cap with proper suffixes
 * @param {string|number} marketCap - The market cap to format
 * @returns {string} Formatted market cap
 */
export const formatMarketCap = (marketCap) => {
  const numMarketCap = parseInt(marketCap || 0);
  
  if (numMarketCap === 0) return 'N/A';
  
  if (numMarketCap >= 1000000000000) {
    return `$${(numMarketCap / 1000000000000).toFixed(1)}T`;
  } else if (numMarketCap >= 1000000000) {
    return `$${(numMarketCap / 1000000000).toFixed(1)}B`;
  } else if (numMarketCap >= 1000000) {
    return `$${(numMarketCap / 1000000).toFixed(1)}M`;
  }
  
  return `$${numMarketCap.toLocaleString()}`;
};

/**
 * Get color for price changes
 * @param {string|number} change - The change value
 * @param {object} theme - Theme object with colors
 * @returns {string} Color for the change
 */
export const getChangeColor = (change, theme) => {
  const numChange = parseFloat(change?.toString().replace('%', '') || 0);
  return numChange >= 0 ? theme.gainColor : theme.lossColor;
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Validate watchlist name
 * @param {string} name - Watchlist name to validate
 * @returns {object} Validation result with isValid and error
 */
export const validateWatchlistName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Watchlist name cannot be empty' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Watchlist name is too long (max 50 characters)' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Show error alert with consistent styling
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Function} onPress - Callback function
 */
export const showErrorAlert = (title = 'Error', message = ERROR_MESSAGES.GENERAL_ERROR, onPress = null) => {
  Alert.alert(title, message, [
    { text: 'OK', onPress: onPress || (() => {}) }
  ]);
};

/**
 * Show success alert with consistent styling
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Function} onPress - Callback function
 */
export const showSuccessAlert = (title = 'Success', message, onPress = null) => {
  Alert.alert(title, message, [
    { text: 'OK', onPress: onPress || (() => {}) }
  ]);
};

/**
 * Show confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {Function} onConfirm - Confirm callback
 * @param {Function} onCancel - Cancel callback
 */
export const showConfirmDialog = (title, message, onConfirm, onCancel = null) => {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel', onPress: onCancel || (() => {}) },
    { text: 'Confirm', style: 'destructive', onPress: onConfirm }
  ]);
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Generate unique ID for watchlists
 * @returns {string} Unique ID
 */
export const generateUniqueId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 5);
};

/**
 * Parse Alpha Vantage API response for stock data
 * @param {object} apiResponse - Raw API response
 * @param {string} type - Type of data (quote, overview, etc.)
 * @returns {object} Parsed stock data
 */
export const parseStockData = (apiResponse, type) => {
  try {
    switch (type) {
      case 'quote':
        const globalQuote = apiResponse['Global Quote'];
        return globalQuote ? {
          symbol: globalQuote['01. symbol'],
          price: globalQuote['05. price'],
          change: globalQuote['09. change'],
          changePercent: globalQuote['10. change percent'],
          volume: globalQuote['06. volume'],
          high: globalQuote['03. high'],
          low: globalQuote['04. low'],
        } : null;
        
      case 'search':
        return apiResponse.bestMatches?.map(match => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          type: match['3. type'],
          region: match['4. region'],
          currency: match['8. currency'],
        })) || [];
        
      case 'timeSeries':
        const timeSeries = apiResponse['Time Series (Daily)'];
        if (!timeSeries) return null;
        
        const dates = Object.keys(timeSeries).slice(0, 7).reverse();
        return {
          labels: dates.map(date => date.slice(5)), // MM-DD format
          datasets: [{
            data: dates.map(date => parseFloat(timeSeries[date]['4. close'])),
          }],
        };
        
      default:
        return apiResponse;
    }
  } catch (error) {
    console.error('Error parsing stock data:', error);
    return null;
  }
};

/**
 * Check if value is empty or null
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  return value === null || value === undefined || value === '' || 
         (Array.isArray(value) && value.length === 0) ||
         (typeof value === 'object' && Object.keys(value).length === 0);
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Calculate percentage change between two values
 * @param {number} oldValue - Previous value
 * @param {number} newValue - Current value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (oldValue, newValue) => {
  if (!oldValue || oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

// Export all helper functions
export default {
  formatPrice,
  formatPercentageChange,
  formatVolume,
  formatMarketCap,
  getChangeColor,
  debounce,
  validateWatchlistName,
  showErrorAlert,
  showSuccessAlert,
  showConfirmDialog,
  formatDate,
  generateUniqueId,
  parseStockData,
  isEmpty,
  capitalize,
  truncateText,
  calculatePercentageChange,
};
