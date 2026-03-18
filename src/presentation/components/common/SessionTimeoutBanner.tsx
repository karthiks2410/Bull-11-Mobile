/**
 * Session Timeout Banner
 * Shows warning when session is about to expire
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export function SessionTimeoutBanner() {
  const { sessionTimeRemaining, updateActivity } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Show warning if less than 5 minutes remaining
    const shouldShow = sessionTimeRemaining > 0 && sessionTimeRemaining < 300; // 5 minutes

    if (shouldShow && !isVisible) {
      setIsVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else if (!shouldShow && isVisible) {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsVisible(false));
    }
  }, [sessionTimeRemaining, isVisible]);

  const handleStayActive = async () => {
    await updateActivity();

    // Hide banner temporarily
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.icon}>⏱️</Text>
          <View style={styles.messageContainer}>
            <Text style={styles.title}>Session Expiring Soon</Text>
            <Text style={styles.message}>
              Your session will expire in {formatTime(sessionTimeRemaining)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleStayActive}>
          <Text style={styles.buttonText}>Stay Active</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingTop: 16, // Account for status bar
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  messageContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: '#B45309',
  },
  button: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
