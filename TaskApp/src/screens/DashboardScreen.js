import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const DashboardScreen = ({ navigation }) => {
  const { user, token, logout } = useAuth();
  const [tasks, setTasks] = useState([]); // Today/Active Tasks
  const [pendingTasks, setPendingTasks] = useState([]); // Requests
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('TODAY'); // TODAY | REQUESTS

  const fetchData = async () => {
    try {
      // 1. Fetch My Tasks (Active/Accepted)
      const myTasksData = await api('/tasks', { token });
      setTasks(myTasksData);

      // 2. Fetch Pending Requests
      const pendingData = await api('/tasks/pending', { token });
      setPendingTasks(pendingData);
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleResponse = async (taskId, status) => {
      try {
          await api('/tasks/respond', {
              method: 'POST',
              body: JSON.stringify({ taskId, status, reason: 'Manual response' }),
              token
          });
          onRefresh(); // Refresh list
      } catch (error) {
          Alert.alert('Error', 'Failed to respond');
      }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (taskId, newStatus) => {
      try {
          await api('/tasks/status', {
              method: 'POST',
              body: JSON.stringify({ taskId, status: newStatus }),
              token
          });
          onRefresh();
      } catch (error) {
          Alert.alert('Error', 'Failed to update status');
      }
  };

  const renderTask = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text>{item.description}</Text>
      <Text style={styles.status}>{item.status}</Text>
      
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        {item.status === 'ACCEPTED' && (
            <Button title="Start" onPress={() => handleStatusUpdate(item.id, 'STARTED')} />
        )}
        {item.status === 'STARTED' && (
            <>
                <Button title="Complete" onPress={() => handleStatusUpdate(item.id, 'COMPLETED')} />
                <View style={{ width: 10 }} />
                <Button title="Fail" color="red" onPress={() => handleStatusUpdate(item.id, 'FAILED')} />
            </>
        )}
      </View>
    </View>
  );

  const renderRequest = ({ item }) => (
    <View style={[styles.card, { borderColor: 'orange', borderWidth: 1 }]}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text>Type: {item.task_type} | Score: {item.score}</Text>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Button title="Accept" onPress={() => handleResponse(item.id, 'ACCEPTED')} />
          <View style={{ width: 10 }} />
          <Button title="Reject" color="red" onPress={() => handleResponse(item.id, 'REJECTED')} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Hello, {user?.name}</Text>
        <View style={{ flexDirection: 'row' }}>
           <Button title="Cal" onPress={() => navigation.navigate('Calendar')} />
           <View style={{ width: 10 }} />
           <Button title="Switch" onPress={() => navigation.navigate('SwitchContext')} />
           <Button title="Logout" onPress={logout} />
        </View>
      </View>

      <View style={styles.tabs}>
          <Button title="Today" onPress={() => setActiveTab('TODAY')} disabled={activeTab === 'TODAY'} />
          <Button title={`Requests (${pendingTasks.length})`} onPress={() => setActiveTab('REQUESTS')} disabled={activeTab === 'REQUESTS'} />
      </View>
      
      {activeTab === 'TODAY' && (
          <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={item => item.id.toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={<Text style={{ padding: 20 }}>No active tasks.</Text>}
          />
      )}

      {activeTab === 'REQUESTS' && (
          <FlatList
            data={pendingTasks}
            renderItem={renderRequest}
            keyExtractor={item => item.id.toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={<Text style={{ padding: 20 }}>No pending requests.</Text>}
          />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateTask')}>
          <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  welcome: { fontSize: 18, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  card: { padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 10, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  status: { color: 'gray', marginTop: 5, fontSize: 12 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: 'white', fontSize: 30 }
});

export default DashboardScreen;
