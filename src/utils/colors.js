// Groww-inspired color palette
export const colors = {
    // Primary Colors
    primary: '#00D09C',
    primaryDark: '#00B386',
    primaryLight: '#33DDB1',
    
    // Background Colors
    backgroundLight: '#FFFFFF',
    backgroundDark: '#121212',
    surfaceLight: '#F8F9FA',
    surfaceDark: '#1E1E1E',
    cardLight: '#FFFFFF',
    cardDark: '#2A2A2A',
    
    // Text Colors
    textPrimaryLight: '#212121',
    textPrimaryDark: '#FFFFFF',
    textSecondaryLight: '#757575',
    textSecondaryDark: '#AAAAAA',
    
    // Border Colors
    borderLight: '#E0E0E0',
    borderDark: '#333333',
    
    // Status Colors
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    
    // Market Colors
    gainColor: '#00D09C',
    lossColor: '#F44336',
    neutralColor: '#757575',
    
    // Additional Colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    
    // Opacity Variants
    primaryOpacity: (opacity) => `rgba(0, 208, 156, ${opacity})`,
    errorOpacity: (opacity) => `rgba(244, 67, 54, ${opacity})`,
    blackOpacity: (opacity) => `rgba(0, 0, 0, ${opacity})`,
    whiteOpacity: (opacity) => `rgba(255, 255, 255, ${opacity})`,
  };
  
  // Color helper functions
  export const getThemeColors = (isDarkMode) => {
    return {
      primary: colors.primary,
      primaryDark: colors.primaryDark,
      background: isDarkMode ? colors.backgroundDark : colors.backgroundLight,
      surface: isDarkMode ? colors.surfaceDark : colors.surfaceLight,
      cardBackground: isDarkMode ? colors.cardDark : colors.cardLight,
      text: isDarkMode ? colors.textPrimaryDark : colors.textPrimaryLight,
      textSecondary: isDarkMode ? colors.textSecondaryDark : colors.textSecondaryLight,
      border: isDarkMode ? colors.borderDark : colors.borderLight,
      error: colors.error,
      success: colors.success,
      warning: colors.warning,
      gainColor: colors.gainColor,
      lossColor: colors.lossColor,
      statusBar: isDarkMode ? 'light-content' : 'dark-content',
    };
  };
  