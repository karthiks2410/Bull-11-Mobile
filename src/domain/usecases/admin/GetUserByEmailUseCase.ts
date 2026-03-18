/**
 * Use Case: Get User By Email (Admin Only)
 * Single Responsibility: Search user by email address
 */

import { User } from '../../entities/User';
import { AdminRepository } from '../../repositories/AdminRepository';

export class GetUserByEmailUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(email: string): Promise<User> {
    if (!email || !email.includes('@')) {
      throw new Error('Valid email address is required');
    }

    return await this.adminRepository.getUserByEmail(email);
  }
}
