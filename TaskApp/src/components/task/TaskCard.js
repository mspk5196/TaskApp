import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import theme from '../../styles/theme';

const TaskCard = ({ task, onPress, onAction, showActions = true }) => {
  const getStatusVariant = (status) => {
    const statusMap = {
      'PENDING': 'pending',
      'PENDING_ACCEPTANCE': 'pending',
      'ACCEPTED': 'accepted',
      'STARTED': 'inProgress',
      'IN_PROGRESS': 'inProgress',
      'COMPLETED': 'completed',
      'OVERDUE': 'overdue',
      'PAUSED': 'paused',
    };
    return statusMap[status] || 'default';
  };

  const getTaskTypeColor = (type) => {
    const typeMap = {
      'FIXED': theme.colors.primary,
      'FLOATING': theme.colors.secondary,
      'SUBSCRIPTION': theme.colors.warning,
      'BIDDING': theme.colors.info,
      'MEETING': theme.colors.success,
    };
    return typeMap[type] || theme.colors.gray500;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
            <Badge text={task.status} variant={getStatusVariant(task.status)} size="sm" />
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.typeBadge, { backgroundColor: getTaskTypeColor(task.task_type) }]}>
              <Text style={styles.typeText}>{task.task_type}</Text>
            </View>
            {task.score > 0 && (
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>⭐ {task.score} pts</Text>
              </View>
            )}
          </View>
        </View>

        {task.description && (
          <Text style={styles.description} numberOfLines={2}>{task.description}</Text>
        )}

        <View style={styles.footer}>
          <View style={styles.timeInfo}>
            {task.start_time && (
              <Text style={styles.time}>🕐 {formatTime(task.start_time)}</Text>
            )}
            {task.deadline && (
              <Text style={styles.deadline}>📅 Due: {new Date(task.deadline).toLocaleDateString()}</Text>
            )}
          </View>

          {showActions && onAction && (
            <View style={styles.actions}>
              {task.status === 'PENDING_ACCEPTANCE' && (
                <>
                  <Button 
                    title="Accept" 
                    variant="success" 
                    size="sm" 
                    onPress={() => onAction('accept', task.id)}
                    style={styles.actionButton}
                  />
                  <Button 
                    title="Reject" 
                    variant="danger" 
                    size="sm" 
                    onPress={() => onAction('reject', task.id)}
                    style={styles.actionButton}
                  />
                </>
              )}
              {task.status === 'ACCEPTED' && (
                <Button 
                  title="Start" 
                  variant="primary" 
                  size="sm" 
                  onPress={() => onAction('start', task.id)}
                />
              )}
              {task.status === 'STARTED' && (
                <>
                  <Button 
                    title="Complete" 
                    variant="success" 
                    size="sm" 
                    onPress={() => onAction('complete', task.id)}
                    style={styles.actionButton}
                  />
                  <Button 
                    title="Pause" 
                    variant="ghost" 
                    size="sm" 
                    onPress={() => onAction('pause', task.id)}
                  />
                </>
              )}
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h4,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  typeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    ...theme.typography.caption,
    color: theme.colors.gray600,
    fontWeight: '600',
  },
  description: {
    ...theme.typography.bodySmall,
    color: theme.colors.gray600,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flex: 1,
  },
  time: {
    ...theme.typography.caption,
    color: theme.colors.gray500,
    marginBottom: 2,
  },
  deadline: {
    ...theme.typography.caption,
    color: theme.colors.warning,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionButton: {
    marginRight: theme.spacing.xs,
  },
});

export default TaskCard;
