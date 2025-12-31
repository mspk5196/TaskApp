import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const CreateTaskScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('FIXED'); // Default
  const [score, setScore] = useState('10');
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);

  // Type specific fields
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00:00');
  const [endTime, setEndTime] = useState('10:00:00');

  const handleCreate = async () => {
      if (!title || !assigneeId) {
          Alert.alert('Error', 'Title and Assignee ID are required');
          return;
      }

      setLoading(true);
      try {
          // Use new typed endpoint
          await api('/tasks/typed', {
              method: 'POST',
              body: JSON.stringify({
                  title,
                  description,
                  type: taskType,
                  score: parseInt(score),
                  closing_criteria: 'MANUAL',
                  assignees: [assigneeId],
                  startDate,
                  endDate: taskType === 'FIXED' ? startDate : endDate, // Fixed implies single day usually
                  fixedStartTime: startTime,
                  fixedEndTime: endTime
              }),
              token
          });
          Alert.alert('Success', 'Task Created');
          navigation.goBack();
      } catch (error) {
          Alert.alert('Error', error.message || 'Failed to create task');
      } finally {
          setLoading(false);
      }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create New Task</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Task Title" />

      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Description" multiline />

      <Text style={styles.label}>Type</Text>
      <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Button title="Fixed" onPress={() => setTaskType('FIXED')} color={taskType === 'FIXED' ? 'blue' : 'gray'} />
          <View style={{ width: 10 }} />
          <Button title="Floating" onPress={() => setTaskType('FLOATING')} color={taskType === 'FLOATING' ? 'blue' : 'gray'} />
      </View>

      {taskType === 'FIXED' && (
          <>
             <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
             <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} />
             <Text style={styles.label}>Start Time (HH:MM:SS)</Text>
             <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} />
             <Text style={styles.label}>End Time (HH:MM:SS)</Text>
             <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} />
          </>
      )}

      {taskType === 'FLOATING' && (
          <>
             <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
             <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} />
             <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
             <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} />
          </>
      )}

      <Text style={styles.label}>Score Points</Text>
      <TextInput style={styles.input} value={score} onChangeText={setScore} keyboardType="numeric" />

      <Text style={styles.label}>Assignee User ID</Text>
      <TextInput style={styles.input} value={assigneeId} onChangeText={setAssigneeId} keyboardType="numeric" placeholder="User ID" />

      <Button title={loading ? "Creating..." : "Create Task"} onPress={handleCreate} disabled={loading} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 5, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 15 }
});

export default CreateTaskScreen;
