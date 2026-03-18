/**
 * Use Case: Get Kite Login URL (Admin Only)
 * Single Responsibility: Generate Kite OAuth URL for admin authentication
 */

import { AdminRepository } from '../../repositories/AdminRepository';

export class GetKiteLoginUrlUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(): Promise<string> {
    return await this.adminRepository.getKiteLoginUrl();
  }
}
