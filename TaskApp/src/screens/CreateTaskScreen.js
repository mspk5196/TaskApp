import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import theme from '../styles/theme';

const CreateTaskScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('FIXED');
  const [score, setScore] = useState('10');
  const [assigneeId, setAssigneeId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00:00');
  const [endTime, setEndTime] = useState('10:00:00');
  const [closingCriteria, setClosingCriteria] = useState('MANUAL');

  const taskTypes = [
    { value: 'FIXED', label: 'Fixed Time', icon: '⏰', color: theme.colors.primary },
    { value: 'FLOATING', label: 'Floating', icon: '📅', color: theme.colors.secondary },
    { value: 'SUBSCRIPTION', label: 'Subscription', icon: '🎫', color: theme.colors.warning },
    { value: 'BIDDING', label: 'Bidding', icon: '🎯', color: theme.colors.info },
    { value: 'MEETING', label: 'Meeting', icon: '👥', color: theme.colors.success },
    { value: 'PACKAGE', label: 'Package', icon: '📦', color: theme.colors.purple },
  ];

  const closureCriteria = [
    { value: 'MANUAL', label: 'Manual Close', icon: '✋' },
    { value: 'OTP', label: 'OTP Verification', icon: '🔐' },
    { value: 'QR', label: 'QR Scan', icon: '📱' },
    { value: 'PHOTO', label: 'Photo Upload', icon: '📸' },
    { value: 'ATTENDANCE', label: 'Attendance', icon: '✅' },
  ];

  const handleCreate = async () => {
    if (!title || !assigneeId) {
      Alert.alert('Error', 'Title and Assignee are required');
      return;
    }

    setLoading(true);
    try {
      await api('/tasks/typed', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          type: taskType,
          score: parseInt(score),
          closing_criteria: closingCriteria,
          assignees: [assigneeId],
          startDate,
          endDate: taskType === 'FIXED' ? startDate : endDate,
          fixedStartTime: startTime,
          fixedEndTime: endTime,
          dailyQuotaMinutes: taskType === 'SUBSCRIPTION' ? parseInt(description) || 60 : 0
        }),
        token
      });
      Alert.alert('Success', 'Task created successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>📋 Task Basics</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Task Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter task title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={theme.colors.gray400}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter task description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor={theme.colors.gray400}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Score Points</Text>
        <TextInput
          style={styles.input}
          placeholder="10"
          value={score}
          onChangeText={setScore}
          keyboardType="numeric"
          placeholderTextColor={theme.colors.gray400}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>🎯 Task Type</Text>
      
      <View style={styles.typeGrid}>
        {taskTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeCard,
              taskType === type.value && { borderColor: type.color, borderWidth: 2 }
            ]}
            onPress={() => setTaskType(type.value)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <Text style={styles.typeLabel}>{type.label}</Text>
            {taskType === type.value && (
              <View style={[styles.selectedBadge, { backgroundColor: type.color }]}>
                <Text style={styles.selectedText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {taskType === 'FIXED' && (
        <Card style={styles.detailCard}>
          <Text style={styles.detailTitle}>Fixed Time Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Start Time</Text>
              <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>End Time</Text>
              <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} />
            </View>
          </View>
        </Card>
      )}

      {taskType === 'FLOATING' && (
        <Card style={styles.detailCard}>
          <Text style={styles.detailTitle}>Floating Task Window</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>End Date</Text>
            <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} />
          </View>
        </Card>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>👤 Assignment</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Assignee User ID *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter user ID"
          value={assigneeId}
          onChangeText={setAssigneeId}
          keyboardType="numeric"
          placeholderTextColor={theme.colors.gray400}
        />
        <Text style={styles.hint}>Enter the ID of the user to assign this task</Text>
      </View>

      <Text style={[styles.label, { marginTop: 20 }]}>Closure Criteria</Text>
      <View style={styles.criteriaGrid}>
        {closureCriteria.map((criteria) => (
          <TouchableOpacity
            key={criteria.value}
            style={[
              styles.criteriaCard,
              closingCriteria === criteria.value && styles.criteriaCardSelected
            ]}
            onPress={() => setClosingCriteria(criteria.value)}
          >
            <Text style={styles.criteriaIcon}>{criteria.icon}</Text>
            <Text style={styles.criteriaLabel}>{criteria.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={styles.stepDot}>
          <View style={[styles.dot, step >= s && styles.dotActive]}>
            {step > s ? (
              <Text style={styles.dotText}>✓</Text>
            ) : (
              <Text style={[styles.dotText, step === s && { color: theme.colors.white }]}>{s}</Text>
            )}
          </View>
          {s < 3 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Task</Text>
        <View style={{ width: 50 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <Button
            title="Previous"
            variant="secondary"
            onPress={() => setStep(step - 1)}
            style={{ flex: 1, marginRight: 8 }}
          />
        )}
        {step < 3 ? (
          <Button
            title="Next"
            onPress={() => setStep(step + 1)}
            style={{ flex: 1 }}
          />
        ) : (
          <Button
            title="Create Task"
            onPress={handleCreate}
            loading={loading}
            style={{ flex: 1 }}
          />
        )}
      </View>
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
  backButton: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    ...theme.typography.h3,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  stepDot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
  },
  dotText: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.gray500,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: theme.colors.gray200,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  stepTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.gray700,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.gray900,
    backgroundColor: theme.colors.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    ...theme.typography.caption,
    color: theme.colors.gray500,
    marginTop: 4,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  typeCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.gray200,
    position: 'relative',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  typeLabel: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  detailCard: {
    marginTop: theme.spacing.md,
  },
  detailTitle: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  criteriaCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray300,
  },
  criteriaCardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: theme.colors.primaryLight + '10',
  },
  criteriaIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  criteriaLabel: {
    ...theme.typography.caption,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
  },
});

export default CreateTaskScreen;
