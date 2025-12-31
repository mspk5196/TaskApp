import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '../../styles/theme';

const Card = ({ children, style, elevated = true, padding = 'md' }) => {
  const cardStyles = [
    styles.card,
    elevated && theme.shadows.md,
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    style
  ];

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  paddingSm: {
    padding: theme.spacing.sm,
  },
  paddingMd: {
    padding: theme.spacing.md,
  },
  paddingLg: {
    padding: theme.spacing.lg,
  },
});

export default Card;
