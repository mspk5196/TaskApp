import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import TaskCard from '../components/task/TaskCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import theme from '../styles/theme';

const DashboardScreen = ({ navigation }) => {
  const { user, token, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('TODAY');
  const [showAwareness, setShowAwareness] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });

  const checkMorningAwareness = () => {
      const now = new Date();
      const hour = now.getHours();
      const minutes = now.getMinutes();
      if (hour >= 6 && (hour < 8 || (hour === 8 && minutes <= 30))) {
          if (tasks.length > 0) {
              setShowAwareness(true);
          }
      }
  };

  const fetchData = async () => {
    try {
      await api('/tasks/refresh-status', { token });
      const myTasksData = await api('/tasks', { token });
      setTasks(myTasksData);
      
      const pendingData = await api('/tasks/pending', { token });
      setPendingTasks(pendingData);
      
      // Calculate stats
      const completed = myTasksData.filter(t => t.status === 'COMPLETED').length;
      const pending = myTasksData.filter(t => t.status === 'PENDING_ACCEPTANCE').length;
      const overdue = myTasksData.filter(t => t.status === 'OVERDUE').length;
      setStats({ total: myTasksData.length, completed, pending, overdue });
      
      checkMorningAwareness();
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleTaskAction = async (action, taskId) => {
      try {
          if (action === 'accept' || action === 'reject') {
              await api('/tasks/respond', {
                  method: 'POST',
                  body: JSON.stringify({ 
                      taskId, 
                      status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
                      reason: 'User action'
                  }),
                  token
              });
          } else {
              const statusMap = {
                  'start': 'STARTED',
                  'complete': 'COMPLETED',
                  'pause': 'PAUSED',
                  'fail': 'FAILED'
              };
              await api('/tasks/status', {
                  method: 'POST',
                  body: JSON.stringify({ taskId, status: statusMap[action] }),
                  token
              });
          }
          onRefresh();
      } catch (error) {
          console.error('Action failed:', error);
      }
  };

  const handleAcknowledge = () => {
      setShowAwareness(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayTasks = tasks.filter(t => 
    t.status !== 'PENDING_ACCEPTANCE' && t.status !== 'REJECTED' && t.status !== 'COMPLETED'
  );

  return (
    <View style={styles.container}>
      <Modal visible={showAwareness} transparent animationType="slide">
          <View style={styles.modalOverlay}>
              <Card style={styles.modalCard}>
                  <Text style={styles.modalTitle}>🌅 Morning Awareness</Text>
                  <Text style={styles.modalText}>You have {tasks.length} tasks today. Please acknowledge to proceed.</Text>
                  <Button title="I Acknowledge" onPress={handleAcknowledge} fullWidth />
              </Card>
          </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'} 👋</Text>
          <Text style={styles.subtitle}>Here's your day at a glance</Text>
        </View>
        <View style={styles.headerActions}>
           <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconButton}>
             <Text style={styles.iconText}>🔔</Text>
             {pendingTasks.length > 0 && <View style={styles.notifBadge}><Text style={styles.notifText}>{pendingTasks.length}</Text></View>}
           </TouchableOpacity>
           <TouchableOpacity onPress={() => navigation.navigate('Calendar')} style={styles.iconButton}>
             <Text style={styles.iconText}>📅</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={() => navigation.navigate('IdentitySelector')} style={styles.iconButton}>
             <Text style={styles.iconText}>👤</Text>
           </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.warning }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.danger }]}>{stats.overdue}</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{user?.score || 0}</Text>
          <Text style={styles.statLabel}>Score ⭐</Text>
        </Card>
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'TODAY' && styles.activeTab]} 
            onPress={() => setActiveTab('TODAY')}
          >
              <Text style={[styles.tabText, activeTab === 'TODAY' && styles.activeTabText]}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'REQUESTS' && styles.activeTab]} 
            onPress={() => setActiveTab('REQUESTS')}
          >
              <Text style={[styles.tabText, activeTab === 'REQUESTS' && styles.activeTabText]}>
                Requests {pendingTasks.length > 0 && `(${pendingTasks.length})`}
              </Text>
          </TouchableOpacity>
      </View>
      
      {/* Task List */}
      <ScrollView 
        style={styles.taskList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
          {activeTab === 'TODAY' && (
              todayTasks.length > 0 ? (
                  todayTasks.map(task => (
                      <TaskCard 
                          key={task.id} 
                          task={task} 
                          onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                          onAction={handleTaskAction}
                      />
                  ))
              ) : (
                  <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>🎉 No active tasks for today!</Text>
                  </View>
              )
          )}

          {activeTab === 'REQUESTS' && (
              pendingTasks.length > 0 ? (
                  pendingTasks.map(task => (
                      <TaskCard 
                          key={task.id} 
                          task={task} 
                          onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                          onAction={handleTaskAction}
                      />
                  ))
              ) : (
                  <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>📭 No pending requests</Text>
                  </View>
              )
          )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateTask')}>
          <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
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
  greeting: { 
    ...theme.typography.h2,
    color: theme.colors.gray900,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.gray500,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconText: {
    fontSize: 20,
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.danger,
    borderRadius: theme.borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notifText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  statsContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  statCard: {
    marginRight: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minWidth: 100,
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.gray600,
  },
  tabs: { 
    flexDirection: 'row', 
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  tab: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.body,
    color: theme.colors.gray500,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  taskList: {
    flex: 1,
    padding: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.gray400,
  },
  fab: { 
    position: 'absolute', 
    right: theme.spacing.lg, 
    bottom: theme.spacing.lg, 
    width: 56, 
    height: 56, 
    borderRadius: theme.borderRadius.full, 
    backgroundColor: theme.colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    ...theme.shadows.lg,
  },
  fabText: { 
    color: theme.colors.white, 
    fontSize: 32,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  modalText: {
    ...theme.typography.body,
    color: theme.colors.gray600,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
});

export default DashboardScreen;
