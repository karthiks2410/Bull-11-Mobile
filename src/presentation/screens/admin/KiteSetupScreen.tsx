/**
 * Kite Setup Screen
 * Admin screen for configuring Zerodha Kite integration
 * Handles OAuth flow and manual token entry
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { container } from '@/src/core/di/container';
import { AuditLogger, AuditAction } from '@/src/core/security';
import { useAuth } from '@/src/presentation/hooks/useAuth';

// Close the web browser when component unmounts
WebBrowser.maybeCompleteAuthSession();

export default function KiteSetupScreen() {
  const { user: currentUser, updateActivity } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requestToken, setRequestToken] = useState('');
  const [authUrl, setAuthUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'authenticating' | 'completing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [kiteSession, setKiteSession] = useState<{
    sessionValid: boolean;
    tickerConnected: boolean;
    userId?: string;
    expiresAt?: string;
  } | null>(null);

  // Check existing Kite session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        setLoading(true);
        const sessionStatus = await container.checkKiteStatusUseCase.execute();
        setKiteSession(sessionStatus);

        if (sessionStatus.sessionValid) {
          setStatus('success');
          setSuccessMessage('Kite is already connected and active!');
        }
      } catch (error: any) {
        // If status check fails, it means no session exists - this is OK
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // Handle deep link callback
  useEffect(() => {
    const handleDeepLink = (event: Linking.EventType) => {
      const url = event.url;

      // Check if this is a Kite callback URL
      if (url && url.includes('request_token=')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const token = urlParams.get('request_token');

        if (token) {
          setRequestToken(token);
          setStatus('authenticating');
          Alert.alert(
            'Token Received',
            'Request token captured! Click "Complete Authentication" to finish setup.',
            [{ text: 'OK' }]
          );
        }
      }
    };

    // Add listener for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleStartAuthentication = async () => {
    try {
      setLoading(true);
      setStatus('authenticating');
      setErrorMessage('');
      setSuccessMessage('');

      // Update activity
      await updateActivity();

      // Check if already authenticated
      const sessionStatus = await container.checkKiteStatusUseCase.execute();
      if (sessionStatus.sessionValid) {
        setKiteSession(sessionStatus);
        setStatus('success');
        setSuccessMessage('Kite is already connected and active!');
        Alert.alert(
          'Already Connected',
          `You are already authenticated with Kite!\n\n` +
          `User ID: ${sessionStatus.userId}\n` +
          `Ticker: ${sessionStatus.tickerConnected ? '✅ Connected' : '❌ Not Connected'}\n` +
          `Expires: ${sessionStatus.expiresAt ? new Date(sessionStatus.expiresAt).toLocaleString() : 'N/A'}`,
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Log initiation
      await AuditLogger.log(
        AuditAction.KITE_SETUP_INITIATED,
        currentUser?.id,
        currentUser?.email,
        { timestamp: Date.now() },
        true
      );

      // Get the Kite login URL from backend
      const loginUrl = await container.getKiteLoginUrlUseCase.execute();
      setAuthUrl(loginUrl);

      // Open the URL in browser
      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl,
        Linking.createURL('/')
      );

      // When browser closes (user completes auth or cancels)
      if (result.type === 'dismiss' || result.type === 'cancel') {
        // Backend handles the callback automatically
        setStatus('success');
        setSuccessMessage(
          'Browser closed. If you completed the Kite authentication and clicked "Authorize", ' +
          'the backend has already processed it and created your session!'
        );

        Alert.alert(
          'Authentication Complete',
          'If you successfully authorized the app in Kite:\n\n' +
          '✅ You are now connected!\n' +
          '✅ Backend has created the session\n' +
          '✅ WebSocket ticker is initialized\n\n' +
          'You can verify by checking the Admin Dashboard - the Kite API status should show as connected.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (result.type === 'success' && result.url) {
        // Extract request_token from callback URL
        const urlParams = new URLSearchParams(result.url.split('?')[1]);
        const token = urlParams.get('request_token');

        if (token) {
          setRequestToken(token);
          Alert.alert(
            'Authentication Started',
            'Token received! Click "Complete Authentication" to finish.',
            [{ text: 'OK' }]
          );
        }
      } else if (result.type === 'cancel') {
        setStatus('idle');
        Alert.alert('Cancelled', 'Authentication was cancelled.');
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to start authentication');
      Alert.alert('Error', error.message || 'Failed to start authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAuthentication = async () => {
    if (!requestToken.trim()) {
      Alert.alert('Error', 'Please enter or obtain a request token first.');
      return;
    }

    try {
      setLoading(true);
      setStatus('completing');
      setErrorMessage('');
      setSuccessMessage('');

      // Update activity
      await updateActivity();

      // Send the request token to backend to complete authentication
      const message = await container.handleKiteCallbackUseCase.execute(requestToken);

      setStatus('success');
      setSuccessMessage(message || 'Kite integration setup successfully!');

      // Log successful completion
      await AuditLogger.log(
        AuditAction.KITE_SETUP_COMPLETED,
        currentUser?.id,
        currentUser?.email,
        { requestToken: requestToken.substring(0, 10) + '...' }, // Partial token for security
        true
      );

      Alert.alert(
        'Success',
        'Kite integration is now active! You can now use live market data.',
        [{ text: 'OK' }]
      );

      // Clear the token
      setRequestToken('');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to complete authentication');
      Alert.alert('Error', error.message || 'Failed to complete authentication');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = () => {
    let bgColor = '#6c757d';
    let text = 'Not Started';

    switch (status) {
      case 'authenticating':
        bgColor = '#ffc107';
        text = 'Authenticating...';
        break;
      case 'completing':
        bgColor = '#17a2b8';
        text = 'Completing...';
        break;
      case 'success':
        bgColor = '#28a745';
        text = 'Connected';
        break;
      case 'error':
        bgColor = '#dc3545';
        text = 'Error';
        break;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <Text style={styles.statusText}>{text}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Kite Integration Setup</Text>
        {renderStatusBadge()}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>What is Kite Integration?</Text>
        <Text style={styles.infoText}>
          Zerodha Kite Connect provides real-time stock market data for NSE and BSE.
          This integration allows Bull-11 to access live stock prices, quotes, and market information.
        </Text>
        <Text style={styles.infoText}>
          As an admin, you need to authenticate with your Zerodha Kite account to enable this feature.
        </Text>
      </View>

      {kiteSession?.sessionValid ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Kite Connection Active</Text>
          <View style={styles.sessionInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User ID:</Text>
              <Text style={styles.infoValue}>{kiteSession.userId || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ticker Status:</Text>
              <Text style={[styles.infoValue, { color: kiteSession.tickerConnected ? '#28a745' : '#dc3545' }]}>
                {kiteSession.tickerConnected ? '✅ Connected' : '❌ Not Connected'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expires At:</Text>
              <Text style={styles.infoValue}>
                {kiteSession.expiresAt ? new Date(kiteSession.expiresAt).toLocaleString() : 'N/A'}
              </Text>
            </View>
          </View>
          <Text style={styles.stepDescription}>
            Your Kite session is active and ready to use. The backend is connected to live market data.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Step 1: Start Authentication</Text>
            <Text style={styles.stepDescription}>
              Click the button below to open Zerodha Kite login page. You'll be redirected to authenticate with your Kite credentials.
            </Text>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleStartAuthentication}
              disabled={loading}
            >
              {loading && status === 'authenticating' ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Start Kite Authentication</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Step 2: Enter Request Token</Text>
            <Text style={styles.stepDescription}>
              After authentication, you'll receive a request token. It should be captured automatically,
              but you can also enter it manually below.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter request token here..."
              value={requestToken}
              onChangeText={setRequestToken}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, styles.successButton, loading && styles.buttonDisabled]}
              onPress={handleCompleteAuthentication}
              disabled={loading || !requestToken.trim()}
            >
              {loading && status === 'completing' ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Complete Authentication</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {successMessage ? (
        <View style={styles.messageCard}>
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        </View>
      ) : null}

      {errorMessage ? (
        <View style={styles.messageCard}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Troubleshooting</Text>
        <Text style={styles.helpText}>
          • If the browser doesn't open, check your internet connection
        </Text>
        <Text style={styles.helpText}>
          • If token is not captured automatically, copy it from the callback URL and paste it manually
        </Text>
        <Text style={styles.helpText}>
          • Make sure you have a valid Zerodha Kite Connect API subscription
        </Text>
        <Text style={styles.helpText}>
          • Request tokens expire after a few minutes - complete the flow quickly
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#e7f3ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0066cc',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  successButton: {
    backgroundColor: '#28a745',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#dee2e6',
    marginVertical: 16,
  },
  messageCard: {
    marginBottom: 16,
  },
  successCard: {
    backgroundColor: '#d4edda',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#155724',
    marginBottom: 4,
  },
  successText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: '#f8d7da',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#721c24',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#721c24',
    lineHeight: 20,
  },
  helpSection: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 4,
  },
  sessionInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  infoValue: {
    fontSize: 14,
    color: '#212529',
  },
});
