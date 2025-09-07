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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import ApiService from '../services/apiService';

const SearchBar = ({ onStockSelect }) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
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
      
      if (response.bestMatches) {
        setResults(response.bestMatches.slice(0, 5)); // Show top 5 results
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStock = (stock) => {
    setQuery('');
    setShowResults(false);
    setResults([]);
    onStockSelect(stock);
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={[styles.resultItem, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}
      onPress={() => handleSelectStock(item)}
    >
      <View>
        <Text style={[styles.symbol, { color: theme.text }]}>
          {item['1. symbol']}
        </Text>
        <Text style={[styles.name, { color: theme.textSecondary }]} numberOfLines={1}>
          {item['2. name']}
        </Text>
      </View>
      <Text style={[styles.type, { color: theme.textSecondary }]}>
        {item['3. type']}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Icon name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Search stocks..."
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="characters"
        />
        {loading && <ActivityIndicator color={theme.primary} />}
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Icon name="close" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      {showResults && results.length > 0 && (
        <View style={[styles.resultsContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <FlatList
            data={results}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item['1. symbol']}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    margin: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  resultsContainer: {
    position: 'absolute',
    top: 70,
    left: 15,
    right: 15,
    borderRadius: 10,
    borderWidth: 1,
    maxHeight: 250,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  symbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 14,
    marginTop: 2,
  },
  type: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});

export default SearchBar;
