import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface ErrorTextProps {
  message: string;
  style?: TextStyle;
}

export const ErrorText: React.FC<ErrorTextProps> = ({ message, style }) => {
  if (!message) return null;

  return <Text style={[styles.error, style]}>{message}</Text>;
};

const styles = StyleSheet.create({
  error: {
    fontSize: 14,
    color: '#dc3545',
    marginVertical: 8,
    textAlign: 'center',
  },
});
