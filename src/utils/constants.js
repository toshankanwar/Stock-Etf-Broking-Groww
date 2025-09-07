// API Configuration
export const API_CONFIG = {
    BASE_URL: 'https://www.alphavantage.co/query',
    API_KEY: 'YOUR_ALPHAVANTAGE_API_KEY', // Replace with your actual API key
    REQUEST_LIMIT: {
      PER_MINUTE: 5,
      PER_DAY: 500,
    },
    REQUEST_DELAY: 12000, // 12 seconds between requests
  };
  
  // Cache Configuration
  export const CACHE_CONFIG = {
    DEFAULT_EXPIRY: 300000, // 5 minutes
    QUOTE_EXPIRY: 60000, // 1 minute
    COMPANY_OVERVIEW_EXPIRY: 3600000, // 1 hour
    SEARCH_EXPIRY: 3600000, // 1 hour
    TIME_SERIES_EXPIRY: 900000, // 15 minutes
    TOP_GAINERS_LOSERS_EXPIRY: 600000, // 10 minutes
  };
  
  // UI Constants
  export const UI_CONSTANTS = {
    HEADER_HEIGHT: 60,
    TAB_BAR_HEIGHT: 60,
    CARD_BORDER_RADIUS: 12,
    BUTTON_BORDER_RADIUS: 25,
    MODAL_BORDER_RADIUS: 20,
    SEARCH_RESULTS_MAX: 5,
    HORIZONTAL_PADDING: 15,
    VERTICAL_PADDING: 20,
  };
  
  // Screen Names
  export const SCREEN_NAMES = {
    HOME: 'Home',
    HOME_TAB: 'HomeTab',
    WATCHLIST: 'Watchlist',
    WATCHLIST_TAB: 'WatchlistTab',
    STOCK_DETAILS: 'StockDetails',
    VIEW_ALL: 'ViewAll',
    WATCHLIST_DETAILS: 'WatchlistDetails',
  };
  
  // Market Data Types
  export const MARKET_DATA_TYPES = {
    GAINERS: 'gainers',
    LOSERS: 'losers',
  };
  
  // Alpha Vantage API Functions
  export const API_FUNCTIONS = {
    TOP_GAINERS_LOSERS: 'TOP_GAINERS_LOSERS',
    GLOBAL_QUOTE: 'GLOBAL_QUOTE',
    COMPANY_OVERVIEW: 'OVERVIEW',
    TIME_SERIES_DAILY: 'TIME_SERIES_DAILY',
    SYMBOL_SEARCH: 'SYMBOL_SEARCH',
  };
  
  // Storage Keys
  export const STORAGE_KEYS = {
    THEME: 'theme',
    WATCHLISTS: 'watchlists',
    CACHE_PREFIX: 'cache_',
  };
  
  // Theme Types
  export const THEME_TYPES = {
    LIGHT: 'light',
    DARK: 'dark',
  };
  
  // Animation Durations
  export const ANIMATIONS = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  };
  
  // Pagination
  export const PAGINATION = {
    ITEMS_PER_PAGE: 20,
    MAX_VISIBLE_STOCKS: 10,
  };
  
  // Chart Configuration
  export const CHART_CONFIG = {
    DAYS_TO_SHOW: 7,
    DEFAULT_HEIGHT: 220,
    BEZIER_CURVE: true,
    DOT_RADIUS: 3,
    STROKE_WIDTH: 2,
  };
  
  // Error Messages
  export const ERROR_MESSAGES = {
    API_LIMIT: 'API limit reached. Please try again later.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    STOCK_NOT_FOUND: 'Stock not found.',
    GENERAL_ERROR: 'Something went wrong. Please try again.',
    NO_DATA: 'No data available.',
    LOADING_ERROR: 'Failed to load data.',
  };
  
  // Success Messages
  export const SUCCESS_MESSAGES = {
    WATCHLIST_CREATED: 'Watchlist created successfully!',
    STOCK_ADDED: 'Stock added to watchlist!',
    STOCK_REMOVED: 'Stock removed from watchlist!',
    WATCHLIST_DELETED: 'Watchlist deleted successfully!',
  };
  
  // Input Validation
  export const VALIDATION = {
    MIN_SEARCH_LENGTH: 3,
    MAX_WATCHLIST_NAME_LENGTH: 50,
    SEARCH_DEBOUNCE_DELAY: 500,
  };
  
  // Icon Names (Expo Vector Icons)
  export const ICONS = {
    HOME: 'home',
    BOOKMARK: 'bookmark',
    BOOKMARK_BORDER: 'bookmark-border',
    SEARCH: 'search',
    CLOSE: 'close',
    ADD: 'add',
    REMOVE: 'remove',
    DELETE: 'delete-outline',
    CHEVRON_RIGHT: 'chevron-right',
    BRIGHTNESS: 'brightness-6',
    SHOW_CHART: 'show-chart',
    TRENDING_UP: 'trending-up',
    TRENDING_DOWN: 'trending-down',
  };
  
  export default {
    API_CONFIG,
    CACHE_CONFIG,
    UI_CONSTANTS,
    SCREEN_NAMES,
    MARKET_DATA_TYPES,
    API_FUNCTIONS,
    STORAGE_KEYS,
    THEME_TYPES,
    ANIMATIONS,
    PAGINATION,
    CHART_CONFIG,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    VALIDATION,
    ICONS,
  };
  