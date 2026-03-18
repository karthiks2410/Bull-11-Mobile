/**
 * Use Case: Logout User
 * Single Responsibility: Handle user logout
 */

import { AuthRepository } from '../../repositories/AuthRepository';

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.logout();
  }
}
