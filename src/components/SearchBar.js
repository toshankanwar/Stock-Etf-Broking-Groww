import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ApiService from '../services/apiService';

const SearchBar = ({ onStockSelect }) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]); // ✅ Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length > 2) {
        searchStocks();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchStocks = async () => {
    try {
      setLoading(true);
      const response = await ApiService.searchSymbol(query);
      
      // ✅ Safe array handling
      if (response && response.bestMatches && Array.isArray(response.bestMatches)) {
        setResults(response.bestMatches.slice(0, 5));
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]); // ✅ Set empty array on error
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStock = (stock) => {
    if (!stock || !onStockSelect) return;
    setQuery('');
    setShowResults(false);
    setResults([]);
    onStockSelect(stock);
  };

  const renderSearchResult = ({ item }) => {
    if (!item) return null; // ✅ Safety check
    
    return (
      <TouchableOpacity
        style={[styles.resultItem, { 
          backgroundColor: theme.cardBackground, 
          borderBottomColor: theme.border 
        }]}
        onPress={() => handleSelectStock(item)}
        activeOpacity={0.7}
      >
        <View style={styles.resultContent}>
          <View>
            <Text style={[styles.symbol, { color: theme.text }]}>
              {item['1. symbol'] || 'N/A'}
            </Text>
            <Text style={[styles.name, { color: theme.textSecondary }]} numberOfLines={1}>
              {item['2. name'] || 'Unknown Company'}
            </Text>
          </View>
          <MaterialIcons name="trending-up" size={20} color={theme.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchBox, { 
        backgroundColor: theme.surface, 
        borderColor: theme.border 
      }]}>
        <MaterialIcons name="search" size={20} color={theme.textMuted} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Search stocks, ETFs..."
          placeholderTextColor={theme.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="characters"
        />
        {loading && <ActivityIndicator color={theme.primary} size="small" />}
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
            <MaterialIcons name="close" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* ✅ Safe results rendering */}
      {showResults && Array.isArray(results) && results.length > 0 && (
        <View style={[styles.resultsContainer, { 
          backgroundColor: theme.cardBackground, 
          borderColor: theme.border,
          shadowColor: theme.shadowColor,
        }]}>
          <FlatList
            data={results}
            renderItem={renderSearchResult}
            keyExtractor={(item, index) => item?.['1. symbol'] || `search_${index}`}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
    zIndex: 1000,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 250,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  resultItem: {
    borderBottomWidth: 1,
  },
  resultContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  name: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default SearchBar;
