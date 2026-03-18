/**
 * Use Case: Get All Users (Admin Only)
 * Single Responsibility: Fetch all users in the system
 */

import { User } from '../../entities/User';
import { AdminRepository } from '../../repositories/AdminRepository';

export class GetAllUsersUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(): Promise<User[]> {
    return await this.adminRepository.getAllUsers();
  }
}
