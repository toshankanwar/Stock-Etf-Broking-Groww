import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [watchlists, setWatchlists] = useState([]); // ✅ Initialize as empty array
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    loadWatchlists();
  }, []);

  const loadWatchlists = async () => {
    try {
      const savedWatchlists = await AsyncStorage.getItem('watchlists');
      if (savedWatchlists) {
        const parsed = JSON.parse(savedWatchlists);
        // ✅ Ensure it's an array
        if (Array.isArray(parsed)) {
          setWatchlists(parsed);
          
          const allFavorites = new Set();
          parsed.forEach(watchlist => {
            if (watchlist && Array.isArray(watchlist.stocks)) {
              watchlist.stocks.forEach(stock => {
                if (stock && stock.symbol) {
                  allFavorites.add(stock.symbol);
                }
              });
            }
          });
          setFavorites(allFavorites);
        } else {
          setWatchlists([]);
        }
      }
    } catch (error) {
      console.error('Error loading watchlists:', error);
      setWatchlists([]); // ✅ Set empty array on error
    }
  };

  const saveWatchlists = async (newWatchlists) => {
    try {
      if (!Array.isArray(newWatchlists)) {
        console.error('Watchlists must be an array');
        return;
      }
      await AsyncStorage.setItem('watchlists', JSON.stringify(newWatchlists));
      setWatchlists(newWatchlists);
    } catch (error) {
      console.error('Error saving watchlists:', error);
    }
  };

  const createWatchlist = (name) => {
    if (!name || typeof name !== 'string') return;
    
    const newWatchlist = {
      id: Date.now().toString(),
      name: name.trim(),
      stocks: [], // ✅ Initialize as empty array
      createdAt: new Date().toISOString(),
    };
    const updatedWatchlists = [...watchlists, newWatchlist];
    saveWatchlists(updatedWatchlists);
  };

  const addToWatchlist = (watchlistId, stock) => {
    if (!watchlistId || !stock || !stock.symbol) return;
    
    const updatedWatchlists = watchlists.map(watchlist => {
      if (watchlist.id === watchlistId && Array.isArray(watchlist.stocks)) {
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
    if (!watchlistId || !stockSymbol) return;
    
    const updatedWatchlists = watchlists.map(watchlist => {
      if (watchlist.id === watchlistId && Array.isArray(watchlist.stocks)) {
        return {
          ...watchlist,
          stocks: watchlist.stocks.filter(stock => stock.symbol !== stockSymbol)
        };
      }
      return watchlist;
    });
    saveWatchlists(updatedWatchlists);
    
    const isInOtherWatchlists = updatedWatchlists.some(watchlist => 
      Array.isArray(watchlist.stocks) && 
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
    if (!watchlistId) return;
    const updatedWatchlists = watchlists.filter(watchlist => watchlist.id !== watchlistId);
    saveWatchlists(updatedWatchlists);
  };

  return (
    <AppContext.Provider value={{
      watchlists: Array.isArray(watchlists) ? watchlists : [], // ✅ Always return array
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

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
