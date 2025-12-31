import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const CalendarScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD

  const fetchSlots = async () => {
    try {
      const data = await api(`/calendar/slots?date=${date}`, { token });
      setSlots(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [date]);

  const renderSlot = ({ item }) => {
      const start = new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const end = new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      return (
        <View style={[styles.slot, item.status === 'RESERVED' && styles.reserved]}>
          <Text style={styles.time}>{start} - {end}</Text>
          <Text style={styles.title}>{item.task_title || item.slot_type}</Text>
          <Text style={styles.status}>{item.status}</Text>
        </View>
      );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Calendar: {date}</Text>
      <View style={{ marginBottom: 10 }}>
          {/* Simple Date Toggles for Demo */}
          <Button title="Today" onPress={() => setDate(new Date().toISOString().split('T')[0])} />
      </View>

      <FlatList
        data={slots}
        renderItem={renderSlot}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<Text style={{ padding: 20 }}>No slots reserved for this day.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  slot: { padding: 15, borderLeftWidth: 5, borderLeftColor: '#ccc', backgroundColor: '#f9f9f9', marginBottom: 10, elevation: 1 },
  reserved: { borderLeftColor: 'green' },
  time: { fontWeight: 'bold', marginBottom: 5 },
  title: { fontSize: 16 },
  status: { color: 'gray', fontSize: 12 }
});

export default CalendarScreen;
