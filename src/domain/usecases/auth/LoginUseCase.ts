/**
 * Use Case: Login User
 * Single Responsibility: Handle user login flow
 */

import { User } from '../../entities/User';
import { AuthRepository } from '../../repositories/AuthRepository';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const { email, password } = request;

    // Business validation
    this.validateEmail(email);
    this.validatePassword(password);

    // Execute login
    const result = await this.authRepository.login(email, password);

    // Store token
    await this.authRepository.storeToken(result.token);

    return result;
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
}
