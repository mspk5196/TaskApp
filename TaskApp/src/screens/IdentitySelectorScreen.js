import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const IdentitySelectorScreen = ({ navigation }) => {
  const { token, switchIdentity } = useAuth(); // Assuming switchIdentity is in context
  const [identities, setIdentities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIdentities();
  }, []);

  const fetchIdentities = async () => {
    try {
      const data = await api('/identities', { token });
      setIdentities(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (identity) => {
    try {
      await switchIdentity(identity);
      // Main Navigator will auto-redirect to Dashboard because user/token state changes
    } catch (error) {
      console.error('Switch failed', error);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Context</Text>
      <FlatList
        data={identities}
        keyExtractor={(item) => item.id.toString() + item.user_type}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.type}>{item.user_type} - {item.subtype}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  card: { padding: 20, backgroundColor: '#eee', marginBottom: 10, borderRadius: 8 },
  name: { fontSize: 18, fontWeight: 'bold' },
  type: { fontSize: 14, color: 'gray' }
});

export default IdentitySelectorScreen;
