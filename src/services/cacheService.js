import AsyncStorage from '@react-native-async-storage/async-storage';

export const setCachedData = async (key, data, expiryTime = 300000) => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expiryTime,
    };
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

export const getCachedData = async (key) => {
  try {
    const cachedItem = await AsyncStorage.getItem(`cache_${key}`);
    if (cachedItem) {
      const { data, timestamp, expiryTime } = JSON.parse(cachedItem);
      const now = Date.now();
      
      if (now - timestamp < expiryTime) {
        return data;
      } else {
        // Remove expired cache
        await AsyncStorage.removeItem(`cache_${key}`);
      }
    }
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const clearCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};
