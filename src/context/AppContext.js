import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [watchlists, setWatchlists] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    loadWatchlists();
  }, []);

  const loadWatchlists = async () => {
    try {
      const savedWatchlists = await AsyncStorage.getItem('watchlists');
      if (savedWatchlists) {
        const parsed = JSON.parse(savedWatchlists);
        setWatchlists(parsed);
        
        // Create favorites set from all watchlists
        const allFavorites = new Set();
        parsed.forEach(watchlist => {
          watchlist.stocks.forEach(stock => allFavorites.add(stock.symbol));
        });
        setFavorites(allFavorites);
      }
    } catch (error) {
      console.error('Error loading watchlists:', error);
    }
  };

  const saveWatchlists = async (newWatchlists) => {
    try {
      await AsyncStorage.setItem('watchlists', JSON.stringify(newWatchlists));
      setWatchlists(newWatchlists);
    } catch (error) {
      console.error('Error saving watchlists:', error);
    }
  };

  const createWatchlist = (name) => {
    const newWatchlist = {
      id: Date.now().toString(),
      name,
      stocks: [],
      createdAt: new Date().toISOString(),
    };
    const updatedWatchlists = [...watchlists, newWatchlist];
    saveWatchlists(updatedWatchlists);
  };

  const addToWatchlist = (watchlistId, stock) => {
    const updatedWatchlists = watchlists.map(watchlist => {
      if (watchlist.id === watchlistId) {
        const stockExists = watchlist.stocks.find(s => s.symbol === stock.symbol);
        if (!stockExists) {
          return { ...watchlist, stocks: [...watchlist.stocks, stock] };
        }
      }
      return watchlist;
    });
    saveWatchlists(updatedWatchlists);
    setFavorites(prev => new Set([...prev, stock.symbol]));
  };

  const removeFromWatchlist = (watchlistId, stockSymbol) => {
    const updatedWatchlists = watchlists.map(watchlist => {
      if (watchlist.id === watchlistId) {
        return {
          ...watchlist,
          stocks: watchlist.stocks.filter(stock => stock.symbol !== stockSymbol)
        };
      }
      return watchlist;
    });
    saveWatchlists(updatedWatchlists);
    
    // Check if stock is in other watchlists
    const isInOtherWatchlists = updatedWatchlists.some(watchlist => 
      watchlist.stocks.some(stock => stock.symbol === stockSymbol)
    );
    
    if (!isInOtherWatchlists) {
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(stockSymbol);
        return newSet;
      });
    }
  };

  const deleteWatchlist = (watchlistId) => {
    const updatedWatchlists = watchlists.filter(watchlist => watchlist.id !== watchlistId);
    saveWatchlists(updatedWatchlists);
  };

  return (
    <AppContext.Provider value={{
      watchlists,
      favorites,
      createWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      deleteWatchlist,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
