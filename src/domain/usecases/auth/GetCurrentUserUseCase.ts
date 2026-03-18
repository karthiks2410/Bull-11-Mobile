/**
 * Use Case: Get Current User
 * Single Responsibility: Fetch authenticated user profile
 */

import { User } from '../../entities/User';
import { AuthRepository } from '../../repositories/AuthRepository';

export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<User> {
    return await this.authRepository.getCurrentUser();
  }
}
