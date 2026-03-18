/**
 * Registration Screen
 * Handles user registration with password validation
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
import { PasswordValidator } from '@/src/core/security';
import type { PasswordValidationResult } from '@/src/core/security';
import { theme } from '@/src/core/theme';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordValidationResult | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  // Update password strength indicator as user types
  const handlePasswordChange = (text: string) => {
    if (text.length > 0) {
      const result = PasswordValidator.validate(text);
      setPasswordStrength(result);
    } else {
      setPasswordStrength(null);
    }
    return text;
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Validate password strength
      const validation = PasswordValidator.validate(data.password);
      if (!validation.isValid) {
        setErrorMessage(validation.errors.join('\n'));
        return;
      }

      // Check password match
      if (data.password !== data.confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
      }

      await register({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      });

      // Registration successful - redirect to login
      Alert.alert(
        'Account Created! 🎉',
        'Your account has been created successfully. Please login to continue.',
        [
          {
            text: 'Go to Login',
            onPress: () => router.replace('/auth/login' as any),
          },
        ]
      );

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setErrorMessage(message);
      Alert.alert('Registration Failed', message);
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
            <Text style={styles.subtitle}>Create Your Account</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              rules={{
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              )}
            />

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
                  placeholder="john@example.com"
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
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      handlePasswordChange(text);
                    }}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                    editable={!isLoading}
                  />

                  {/* Password Strength Indicator */}
                  {passwordStrength && passwordValue.length > 0 && (
                    <View style={styles.strengthContainer}>
                      <View style={styles.strengthBar}>
                        <View
                          style={[
                            styles.strengthFill,
                            {
                              width:
                                passwordStrength.strength === 'weak'
                                  ? '33%'
                                  : passwordStrength.strength === 'medium'
                                  ? '66%'
                                  : '100%',
                              backgroundColor: PasswordValidator.getStrengthColor(
                                passwordStrength.strength
                              ),
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.strengthText,
                          {
                            color: PasswordValidator.getStrengthColor(
                              passwordStrength.strength
                            ),
                          },
                        ]}
                      >
                        {passwordStrength.strength.charAt(0).toUpperCase() +
                          passwordStrength.strength.slice(1)}{' '}
                        password
                      </Text>
                      {passwordStrength.errors.length > 0 && (
                        <View style={styles.requirementsContainer}>
                          <Text style={styles.requirementsTitle}>Requirements:</Text>
                          {passwordStrength.errors.map((error, index) => (
                            <Text key={index} style={styles.requirementText}>
                              • {error}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Please confirm your password',
                validate: (value) =>
                  value === passwordValue || 'Passwords do not match',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              )}
            />

            {errorMessage && <ErrorText message={errorMessage} />}

            <Button
              title={isLoading ? 'Creating Account...' : 'Create Account'}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                🔒 Your data is secure and encrypted
              </Text>
            </View>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.back()}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkBold}>Log In</Text>
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
  strengthContainer: {
    marginTop: theme.spacing.spacing.sm,
  },
  strengthBar: {
    height: 4,
    backgroundColor: theme.colors.border.light,
    borderRadius: theme.spacing.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.spacing.xs,
  },
  strengthFill: {
    height: '100%',
    borderRadius: theme.spacing.borderRadius.sm,
  },
  strengthText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.spacing.sm,
  },
  requirementsContainer: {
    marginTop: theme.spacing.spacing.sm,
    padding: theme.spacing.padding.cardSmall,
    backgroundColor: theme.colors.error.bg,
    borderRadius: theme.spacing.borderRadius.base,
    borderLeftWidth: theme.spacing.borderWidth.thick,
    borderLeftColor: theme.colors.error.light,
  },
  requirementsTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.error.dark,
    marginBottom: theme.spacing.spacing.xs,
  },
  requirementText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error.dark,
    marginBottom: theme.spacing.spacing.xs,
  },
  submitButton: {
    marginTop: theme.spacing.padding.cardLarge,
  },
  infoBox: {
    marginTop: theme.spacing.margin.betweenElements,
    padding: theme.spacing.padding.cardSmall,
    backgroundColor: theme.colors.info.bg,
    borderRadius: theme.spacing.borderRadius.base,
    borderWidth: theme.spacing.borderWidth.thin,
    borderColor: theme.colors.info.light,
  },
  infoText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.info.dark,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  loginLink: {
    marginTop: theme.spacing.margin.betweenElements,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  loginLinkBold: {
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
