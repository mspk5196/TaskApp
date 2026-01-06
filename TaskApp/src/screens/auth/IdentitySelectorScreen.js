import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import useAuth from '../../hooks/useAuth';

const IdentitySelectorScreen = () => {
  const { user, selectIdentity } = useAuth();

  const identities = useMemo(() => {
    const raw = user?.role || '';
    const list = raw
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);
    return list.length > 0 ? list : ['DEFAULT'];
  }, [user]);

  const handleSelect = async (id) => {
    await selectIdentity(id);
    // RootNavigator will now switch to MainNavigator based on isAuthenticated
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your identity</Text>
      <FlatList
        data={identities}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
            <Text style={styles.itemText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    color: '#111827',
  },
  list: {
    paddingBottom: 24,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    marginBottom: 12,
  },
  itemText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
});

export default IdentitySelectorScreen;
