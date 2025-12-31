import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import theme from '../styles/theme';

const TaskDetailScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { token } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);

  useEffect(() => {
    fetchTaskDetail();
  }, [taskId]);

  const fetchTaskDetail = async () => {
    try {
      // In a real app, you'd have a dedicated endpoint
      const tasks = await api('/tasks', { token });
      const foundTask = tasks.find(t => t.id === taskId);
      setTask(foundTask);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    try {
      if (action === 'generateOTP') {
        const result = await api('/tasks/closure/otp/generate', {
          method: 'POST',
          body: JSON.stringify({ taskId }),
          token
        });
        setOtp(result.otp);
        setShowOTP(true);
        Alert.alert('OTP Generated', `Your OTP is: ${result.otp}\nValid for 10 minutes.`);
      } else if (action === 'pause') {
        await api('/tasks/status', {
          method: 'POST',
          body: JSON.stringify({ taskId, status: 'PAUSED' }),
          token
        });
        Alert.alert('Success', 'Task paused');
        fetchTaskDetail();
      } else if (action === 'resume') {
        await api('/tasks/status', {
          method: 'POST',
          body: JSON.stringify({ taskId, status: 'STARTED' }),
          token
        });
        Alert.alert('Success', 'Task resumed');
        fetchTaskDetail();
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <Text>Task not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Banner */}
        <Card style={[styles.statusBanner, { backgroundColor: getStatusColor(task.status) + '20' }]}>
          <View style={styles.statusRow}>
            <Badge text={task.status} variant={getStatusVariant(task.status)} />
            <Text style={styles.statusText}>{getStatusMessage(task.status)}</Text>
          </View>
        </Card>

        {/* Main Info */}
        <Card style={styles.section}>
          <Text style={styles.title}>{task.title}</Text>
          {task.description && (
            <Text style={styles.description}>{task.description}</Text>
          )}
          
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Type</Text>
              <Badge text={task.task_type} variant="primary" />
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Score</Text>
              <Text style={styles.metaValue}>⭐ {task.score} pts</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Closure</Text>
              <Text style={styles.metaValue}>{task.closing_criteria}</Text>
            </View>
          </View>
        </Card>

        {/* Timeline */}
        {task.start_time && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Timeline</Text>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Start</Text>
              <Text style={styles.timelineValue}>
                {new Date(task.start_time).toLocaleString()}
              </Text>
            </View>
            {task.end_time && (
              <View style={styles.timelineItem}>
                <Text style={styles.timelineLabel}>End</Text>
                <Text style={styles.timelineValue}>
                  {new Date(task.end_time).toLocaleString()}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Closure Criteria Actions */}
        {task.closing_criteria !== 'MANUAL' && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>🔐 Closure Actions</Text>
            {task.closing_criteria === 'OTP' && (
              <View>
                <Button
                  title="Generate OTP"
                  onPress={() => handleAction('generateOTP')}
                  variant="primary"
                  fullWidth
                />
                {showOTP && (
                  <View style={styles.otpDisplay}>
                    <Text style={styles.otpLabel}>Your OTP:</Text>
                    <Text style={styles.otpValue}>{otp}</Text>
                  </View>
                )}
              </View>
            )}
            {task.closing_criteria === 'QR' && (
              <Button title="Scan QR Code" variant="primary" fullWidth />
            )}
            {task.closing_criteria === 'PHOTO' && (
              <Button title="Upload Photo" variant="primary" fullWidth />
            )}
          </Card>
        )}

        {/* Actions */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Actions</Text>
          <View style={styles.actionGrid}>
            {task.status === 'STARTED' && (
              <>
                <Button
                  title="Pause Task"
                  onPress={() => handleAction('pause')}
                  variant="ghost"
                  style={styles.actionButton}
                />
                <Button
                  title="Complete"
                  onPress={() => handleAction('complete')}
                  variant="success"
                  style={styles.actionButton}
                />
              </>
            )}
            {task.status === 'PAUSED' && (
              <Button
                title="Resume Task"
                onPress={() => handleAction('resume')}
                variant="primary"
                fullWidth
              />
            )}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const getStatusColor = (status) => {
  const colors = {
    'PENDING': theme.colors.warning,
    'ACCEPTED': theme.colors.info,
    'STARTED': theme.colors.primary,
    'COMPLETED': theme.colors.success,
    'OVERDUE': theme.colors.danger,
    'PAUSED': theme.colors.gray500,
  };
  return colors[status] || theme.colors.gray500;
};

const getStatusVariant = (status) => {
  const variants = {
    'PENDING': 'pending',
    'ACCEPTED': 'accepted',
    'STARTED': 'inProgress',
    'COMPLETED': 'completed',
    'OVERDUE': 'overdue',
    'PAUSED': 'paused',
  };
  return variants[status] || 'default';
};

const getStatusMessage = (status) => {
  const messages = {
    'PENDING': 'Awaiting your acceptance',
    'ACCEPTED': 'Ready to start',
    'STARTED': 'In progress',
    'COMPLETED': 'Successfully completed',
    'OVERDUE': 'Past deadline',
    'PAUSED': 'Temporarily paused',
  };
  return messages[status] || '';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  backButton: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    ...theme.typography.h3,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  statusBanner: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statusText: {
    ...theme.typography.bodySmall,
    color: theme.colors.gray600,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.sm,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.gray600,
    marginBottom: theme.spacing.md,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metaItem: {
    flex: 1,
    minWidth: '30%',
  },
  metaLabel: {
    ...theme.typography.caption,
    color: theme.colors.gray500,
    marginBottom: 4,
  },
  metaValue: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  sectionTitle: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  timelineLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.gray600,
  },
  timelineValue: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  otpDisplay: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  otpLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.gray600,
    marginBottom: 4,
  },
  otpValue: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    fontWeight: '700',
    letterSpacing: 4,
  },
});

export default TaskDetailScreen;
