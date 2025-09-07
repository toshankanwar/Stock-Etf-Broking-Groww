import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

const WatchlistModal = ({ isVisible, onClose, stock }) => {
  const { theme } = useTheme();
  const { watchlists, createWatchlist, addToWatchlist } = useApp();
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      createWatchlist(newWatchlistName.trim());
      setNewWatchlistName('');
      setShowCreateForm(false);
      Alert.alert('Success', 'Watchlist created successfully!');
    } else {
      Alert.alert('Error', 'Please enter a valid watchlist name');
    }
  };

  const handleAddToWatchlist = (watchlistId) => {
    addToWatchlist(watchlistId, stock);
    onClose();
    Alert.alert('Success', 'Stock added to watchlist!');
  };

  const renderWatchlistItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.watchlistItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={() => handleAddToWatchlist(item.id)}
    >
      <View style={styles.watchlistInfo}>
        <Text style={[styles.watchlistName, { color: theme.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.stockCount, { color: theme.textSecondary }]}>
          {item.stocks.length} stocks
        </Text>
      </View>
      <MaterialIcons name="add" size={24} color={theme.primary} />
    </TouchableOpacity>
  );

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
    >
      <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Add to Watchlist
          </Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.stockInfo, { color: theme.textSecondary }]}>
          Adding {stock?.symbol || 'Stock'} to watchlist
        </Text>

        {!showCreateForm && (
          <>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowCreateForm(true)}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <Text style={styles.createButtonText}>Create New Watchlist</Text>
            </TouchableOpacity>

            {watchlists.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Existing Watchlists
                </Text>
                <FlatList
                  data={watchlists}
                  renderItem={renderWatchlistItem}
                  keyExtractor={(item) => item.id}
                  style={styles.list}
                />
              </>
            )}

            {watchlists.length === 0 && (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="bookmark-border" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No watchlists yet. Create your first one!
                </Text>
              </View>
            )}
          </>
        )}

        {showCreateForm && (
          <View style={styles.createForm}>
            <Text style={[styles.formTitle, { color: theme.text }]}>
              Create New Watchlist
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="Enter watchlist name"
              placeholderTextColor={theme.textSecondary}
              value={newWatchlistName}
              onChangeText={setNewWatchlistName}
              autoFocus
            />
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.border }]}
                onPress={() => {
                  setShowCreateForm(false);
                  setNewWatchlistName('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createFormButton, { backgroundColor: theme.primary }]}
                onPress={handleCreateWatchlist}
              >
                <Text style={styles.createFormButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  stockInfo: {
    fontSize: 14,
    marginBottom: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  list: {
    maxHeight: 200,
  },
  watchlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  watchlistInfo: {
    flex: 1,
  },
  watchlistName: {
    fontSize: 16,
    fontWeight: '600',
  },
  stockCount: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    textAlign: 'center',
  },
  createForm: {
    marginTop: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  createFormButton: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginLeft: 10,
  },
  createFormButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WatchlistModal;
