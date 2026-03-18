/**
 * Use Case: Get User By ID (Admin Only)
 * Single Responsibility: Fetch specific user details by ID
 */

import { User } from '../../entities/User';
import { AdminRepository } from '../../repositories/AdminRepository';

export class GetUserByIdUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(userId: string): Promise<User> {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    return await this.adminRepository.getUserById(userId);
  }
}
