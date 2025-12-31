import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../styles/theme';

const Badge = ({ text, variant = 'default', size = 'md' }) => {
  const badgeStyles = [
    styles.badge,
    styles[variant],
    styles[size]
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`]
  ];

  return (
    <View style={badgeStyles}>
      <Text style={textStyles}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  // Variants
  default: {
    backgroundColor: theme.colors.gray200,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  success: {
    backgroundColor: theme.colors.success,
  },
  warning: {
    backgroundColor: theme.colors.warning,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  pending: {
    backgroundColor: theme.colors.pending,
  },
  accepted: {
    backgroundColor: theme.colors.accepted,
  },
  inProgress: {
    backgroundColor: theme.colors.inProgress,
  },
  completed: {
    backgroundColor: theme.colors.completed,
  },
  overdue: {
    backgroundColor: theme.colors.overdue,
  },
  // Sizes
  sm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  // Text styles
  text: {
    fontWeight: '600',
  },
  defaultText: {
    color: theme.colors.gray700,
  },
  primaryText: {
    color: theme.colors.white,
  },
  successText: {
    color: theme.colors.white,
  },
  warningText: {
    color: theme.colors.white,
  },
  dangerText: {
    color: theme.colors.white,
  },
  pendingText: {
    color: theme.colors.white,
  },
  acceptedText: {
    color: theme.colors.white,
  },
  inProgressText: {
    color: theme.colors.white,
  },
  completedText: {
    color: theme.colors.white,
  },
  overdueText: {
    color: theme.colors.white,
  },
  smText: {
    fontSize: 10,
  },
  mdText: {
    fontSize: 12,
  },
  lgText: {
    fontSize: 14,
  },
});

export default Badge;
