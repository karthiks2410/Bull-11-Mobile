/**
 * Password Validator
 * Validates password strength and security requirements
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;

  /**
   * Validate password with comprehensive checks
   */
  static validate(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let strengthScore = 0;

    // Length check
    if (!password || password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters`);
    } else {
      strengthScore += 1;
    }

    if (password && password.length > this.MAX_LENGTH) {
      errors.push(`Password must not exceed ${this.MAX_LENGTH} characters`);
    }

    // Complexity checks
    if (password && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      strengthScore += 1;
    }

    if (password && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      strengthScore += 1;
    }

    if (password && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      strengthScore += 1;
    }

    if (password && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      strengthScore += 1;
    }

    // Common password check
    if (this.isCommonPassword(password)) {
      errors.push('Password is too common. Choose a more unique password');
      strengthScore = Math.max(0, strengthScore - 2);
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (strengthScore >= 4) strength = 'strong';
    else if (strengthScore >= 2) strength = 'medium';

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    };
  }

  /**
   * Check if password meets minimum requirements (for login)
   */
  static meetsMinimumRequirements(password: string): boolean {
    return password.length >= this.MIN_LENGTH;
  }

  /**
   * Check against common passwords
   */
  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password',
      'password123',
      '12345678',
      'qwerty',
      'abc123',
      'monkey',
      '1234567890',
      'letmein',
      'trustno1',
      'dragon',
      'baseball',
      'iloveyou',
      'master',
      'sunshine',
      'ashley',
      '123123',
      'welcome',
      'admin',
      'password1',
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * Generate password strength color
   */
  static getStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
      case 'weak':
        return '#EF4444'; // Red
      case 'medium':
        return '#F59E0B'; // Orange
      case 'strong':
        return '#10B981'; // Green
    }
  }
}
