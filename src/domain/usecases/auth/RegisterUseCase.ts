/**
 * Use Case: Register User
 * Single Responsibility: Handle user registration flow
 */

import { User } from '../../entities/User';
import { AuthRepository } from '../../repositories/AuthRepository';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  user: User;
}

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    const { email, password, name } = request;

    // Business validation
    this.validateEmail(email);
    this.validatePassword(password);
    this.validateName(name);

    // Execute registration (no token returned, no auto-login)
    const user = await this.authRepository.register(email, password, name);

    return { user };
  }

  private validateEmail(email: string): void {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }
  }

  private validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
  }
}
