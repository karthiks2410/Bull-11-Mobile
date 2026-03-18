/**
 * Login Screen
 * Handles user authentication with rate limiting
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorText } from '../../components/common/ErrorText';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '@/src/core/theme';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const user = await login({
        email: data.email.trim(),
        password: data.password,
      });

      // All users navigate to the same tabs - admins will see extra Admin tab
      router.replace('/(tabs)' as any);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setErrorMessage(message);
      setFailedAttempts((prev) => prev + 1);

      // Show different alerts based on error type
      if (message.includes('Too many failed')) {
        Alert.alert(
          'Account Temporarily Locked',
          message,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert('Login Failed', message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>📈</Text>
            <Text style={styles.title}>Bull-11</Text>
            <Text style={styles.subtitle}>Stock Market Fantasy Game</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="admin@bull11.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!isLoading}
                />
              )}
            />

            {errorMessage && <ErrorText message={errorMessage} />}

            {/* Show rate limit warning after first failed attempt */}
            {failedAttempts > 0 && (
              <View style={styles.warningBox}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>
                  {5 - failedAttempts} attempts remaining. Account will be locked for 15 minutes after 5 failed attempts.
                </Text>
              </View>
            )}

            <Button
              title={isLoading ? 'Logging In...' : 'Log In'}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
            />

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/auth/register' as any)}
            >
              <Text style={styles.registerLinkText}>
                Don't have an account? <Text style={styles.registerLinkBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.padding.screen,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.margin.betweenSections,
  },
  logo: {
    fontSize: theme.typography.fontSize['7xl'],
    marginBottom: theme.spacing.margin.headingBottom,
  },
  title: {
    ...theme.typography.textStyles.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  form: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.spacing.borderRadius.lg,
    padding: theme.spacing.padding.cardLarge,
    ...theme.spacing.shadows.base,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.warning.bgAlt,
    borderRadius: theme.spacing.borderRadius.base,
    padding: theme.spacing.padding.cardSmall,
    marginTop: theme.spacing.margin.betweenElements,
    borderLeftWidth: theme.spacing.borderWidth.thick,
    borderLeftColor: theme.colors.secondary.main,
  },
  warningIcon: {
    fontSize: theme.typography.fontSize.base,
    marginRight: theme.spacing.spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary.dark,
    lineHeight: theme.typography.lineHeight.sm,
  },
  submitButton: {
    marginTop: theme.spacing.padding.cardLarge,
  },
  registerLink: {
    marginTop: theme.spacing.margin.betweenElements,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  registerLinkBold: {
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
